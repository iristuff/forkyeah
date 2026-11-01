// Accounts: sign-in state, and keeping Progress in sync with the cloud.
//
// Progress always lives on the device first (gameStore + localStorage). When
// someone is signed in, this store mirrors it to Firestore: on sign-in it merges
// the device copy with the cloud copy, then saves changes a couple of seconds
// after they happen. Guests never load Firebase at all.
//
//   const { status, user, sync, error, busy } = useAccount();
//   useAccount.getState().signInWithGoogle();
import { create } from 'zustand';
import type { AccountBackend, AccountUser } from '../lib/firebase';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import { authErrorMessage, fromCloudProgress, sameProgress, toCloudProgress } from '../lib/cloudDoc';
import { emptyProgress } from '../lib/game';
import { mergeProgress } from '../lib/mergeProgress';
import type { Progress } from '../types';
import { STORE_VERSION, useGame, type GameState } from './gameStore';
import { localStorageRepo, type SyncStorage } from './progressRepo';

export type AccountStatus =
  | 'disabled' // this build has no Firebase config: guest only
  | 'loading' // checking for a signed-in user
  | 'signed-out'
  | 'signed-in'
  | 'needs-email'; // opened an email sign-in link on another device: ask for the email again

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface AccountState {
  status: AccountStatus;
  user: AccountUser | null;
  sync: SyncStatus;
  lastSyncedAt: string | null;
  busy: boolean; // an action is running: disable buttons
  error: string | null; // friendly message for the last failed action
  emailLinkSentTo: string | null;
  resetSentTo: string | null; // a password reset email went here
  welcomed: boolean; // has seen the sign-in welcome (signed in, or chose to stay a guest)

  start: () => void; // once, at app start
  finishWelcome: () => void; // stay a guest for now: don't show the welcome again
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  completeEmailLink: (email: string) => Promise<void>;
  cancelEmailLink: () => void; // give up on a link opened on another device
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  syncNow: () => Promise<void>;
  clearError: () => void;
}

// Device keys. OWNER = whose progress is on this device (a uid); its presence
// also tells start() to load Firebase. Guest progress has no owner.
export const OWNER_KEY = 'forkyeah:account';
export const EMAIL_KEY = 'forkyeah:emailForSignIn';
export const PENDING_KEY = 'forkyeah:authPending';
export const WELCOMED_KEY = 'forkyeah:welcomed';
export const SAVE_DELAY_MS = 2000;

export interface AccountDeps {
  configured: boolean;
  loadBackend: () => Promise<AccountBackend>;
  game: { getState: () => GameState; subscribe: (fn: (s: GameState, prev: GameState) => void) => () => void };
  storage: SyncStorage;
  page: { href: () => string; origin: () => string; replaceUrl: (url: string) => void };
  online: () => boolean;
  // Browser hooks: retry when back online, save immediately when the app is hidden
  onOnline: (fn: () => void) => void;
  onHidden: (fn: () => void) => void;
  saveDelayMs?: number;
}

const looksLikeEmailLink = (href: string) => /[?&]mode=signIn\b/.test(href) && /[?&]oobCode=/.test(href);
const OFFLINE = 'You’re offline. Signing in needs internet.';

export function createAccountStore(deps: AccountDeps) {
  let backend: Promise<AccountBackend> | undefined;
  let ready = false; // true once this account's cloud copy has been merged in
  let lastPushed = '';
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unwatchGame: (() => void) | undefined;

  const owner = () => deps.storage.getItem(OWNER_KEY);

  return create<AccountState>()((set, get) => {
    function ensureBackend(): Promise<AccountBackend> {
      backend ??= deps.loadBackend().then(b => {
        b.onUserChanged(user => void handleUser(b, user));
        b.completeRedirect()
          .catch(err => set({ error: authErrorMessage(err) }))
          .finally(() => deps.storage.removeItem(PENDING_KEY));
        const href = deps.page.href();
        if (b.isEmailLink(href)) {
          const email = deps.storage.getItem(EMAIL_KEY);
          if (email) void get().completeEmailLink(email);
          else set({ status: 'needs-email' });
        }
        return b;
      });
      backend.catch(() => {
        backend = undefined; // e.g. offline while loading the SDK: allow a retry
        set({ status: 'signed-out', error: OFFLINE });
      });
      return backend;
    }

    async function handleUser(b: AccountBackend, user: AccountUser | null) {
      if (!user) {
        ready = false;
        if (get().status !== 'needs-email') set({ status: 'signed-out', user: null, sync: 'idle' });
        return;
      }
      deps.storage.setItem(WELCOMED_KEY, '1');
      set({ status: 'signed-in', user, error: null, welcomed: true });
      await mergeWithCloud(b, user.uid);
    }

    // First sync after sign-in (or app start): merge device + cloud, save the result
    async function mergeWithCloud(b: AccountBackend, uid: string) {
      ready = false;
      set({ sync: 'syncing' });
      let cloud: Progress | null;
      try {
        cloud = fromCloudProgress(await b.pullProgress(uid));
      } catch {
        set({ sync: deps.online() ? 'error' : 'offline' });
        dirty = true; // retry the whole merge when back online
        return;
      }
      const local = deps.game.getState().progress;
      // Progress left by a different account is never merged into this one
      const base = owner() && owner() !== uid ? emptyProgress() : local;
      const merged = cloud ? mergeProgress(base, cloud) : base;
      if (!sameProgress(merged, local)) deps.game.getState().replaceProgress(merged);
      deps.storage.setItem(OWNER_KEY, uid);
      ready = true;
      dirty = false;
      lastPushed = cloud ? JSON.stringify(toCloudProgress(cloud)) : '';
      watchGame();
      await push();
    }

    function watchGame() {
      unwatchGame ??= deps.game.subscribe((s, prev) => {
        if (s.progress === prev.progress || !ready) return;
        dirty = true;
        clearTimeout(timer);
        timer = setTimeout(() => void push(), deps.saveDelayMs ?? SAVE_DELAY_MS);
      });
    }

    async function push(): Promise<boolean> {
      clearTimeout(timer);
      timer = undefined;
      const uid = get().user?.uid;
      if (!ready || !uid) return false;
      const progress = toCloudProgress(deps.game.getState().progress);
      const json = JSON.stringify(progress);
      if (json === lastPushed) {
        dirty = false;
        set({ sync: 'synced', lastSyncedAt: get().lastSyncedAt ?? new Date().toISOString() });
        return true;
      }
      if (!deps.online()) {
        dirty = true;
        set({ sync: 'offline' });
        return false;
      }
      set({ sync: 'syncing' });
      try {
        await (await ensureBackend()).pushProgress(uid, progress, STORE_VERSION);
        lastPushed = json;
        dirty = false;
        set({ sync: 'synced', lastSyncedAt: new Date().toISOString() });
        return true;
      } catch {
        dirty = true;
        set({ sync: deps.online() ? 'error' : 'offline' });
        return false;
      }
    }

    async function retry() {
      if (!dirty || get().status !== 'signed-in') return;
      const uid = get().user!.uid;
      if (ready) await push();
      else await mergeWithCloud(await ensureBackend(), uid);
    }

    // Wraps a user action: busy flag, friendly errors, and an online check
    async function run(action: () => Promise<void>) {
      if (!deps.online()) {
        set({ error: OFFLINE });
        return;
      }
      set({ busy: true, error: null });
      try {
        await action();
      } catch (err) {
        set({ error: authErrorMessage(err) });
      } finally {
        set({ busy: false });
      }
    }

    function resetToGuest() {
      ready = false;
      dirty = false;
      lastPushed = '';
      clearTimeout(timer);
      deps.storage.removeItem(OWNER_KEY);
      deps.game.getState().resetProgress();
      set({ status: 'signed-out', user: null, sync: 'idle', lastSyncedAt: null });
    }

    deps.onOnline(() => void retry());
    deps.onHidden(() => {
      if (timer) void push();
    });

    return {
      status: deps.configured ? 'loading' : 'disabled',
      user: null,
      sync: 'idle',
      lastSyncedAt: null,
      busy: false,
      error: null,
      emailLinkSentTo: null,
      resetSentTo: null,
      welcomed: !deps.configured || deps.storage.getItem(WELCOMED_KEY) !== null,

      start() {
        if (!deps.configured) return;
        const href = deps.page.href();
        const needed = owner() || deps.storage.getItem(PENDING_KEY) || looksLikeEmailLink(href);
        if (needed) void ensureBackend();
        else set({ status: 'signed-out' }); // a guest: don't download Firebase
      },

      signInWithGoogle: () =>
        run(async () => {
          deps.storage.setItem(PENDING_KEY, '1'); // the redirect reloads the app mid-sign-in
          await (await ensureBackend()).signInWithGoogle();
        }),

      signUpWithEmail: (email, password) =>
        run(async () => (await ensureBackend()).signUpWithEmail(email.trim(), password)),

      signInWithEmail: (email, password) =>
        run(async () => (await ensureBackend()).signInWithEmail(email.trim(), password)),

      sendPasswordReset: email =>
        run(async () => {
          const clean = email.trim();
          await (await ensureBackend()).sendPasswordReset(clean);
          set({ resetSentTo: clean });
        }),

      sendEmailLink: email =>
        run(async () => {
          const clean = email.trim();
          await (await ensureBackend()).sendEmailLink(clean, `${deps.page.origin()}/profile`);
          deps.storage.setItem(EMAIL_KEY, clean);
          set({ emailLinkSentTo: clean });
        }),

      completeEmailLink: email =>
        run(async () => {
          const href = deps.page.href();
          await (await ensureBackend()).completeEmailLink(email.trim(), href);
          deps.storage.removeItem(EMAIL_KEY);
          const url = new URL(href);
          deps.page.replaceUrl(`${url.origin}${url.pathname}`); // drop the one-time code from the address bar
          set({ emailLinkSentTo: null });
        }),

      cancelEmailLink() {
        const url = new URL(deps.page.href());
        deps.page.replaceUrl(`${url.origin}${url.pathname}`);
        set({ status: 'signed-out', error: null });
      },

      signOut: () =>
        run(async () => {
          // Save the latest progress first: signing out clears it from this device
          if (dirty && !(await push())) throw { code: 'forkyeah/unsaved' };
          await (await ensureBackend()).signOut();
          resetToGuest();
        }),

      deleteAccount: () =>
        run(async () => {
          const b = await ensureBackend();
          const uid = get().user?.uid;
          if (!uid) return;
          const progress = toCloudProgress(deps.game.getState().progress);
          await b.deleteProgress(uid);
          try {
            await b.deleteUser();
          } catch (err) {
            await b.pushProgress(uid, progress, STORE_VERSION).catch(() => undefined); // put the data back
            throw err;
          }
          resetToGuest();
        }),

      syncNow: async () => {
        dirty = true;
        await retry();
      },

      finishWelcome() {
        deps.storage.setItem(WELCOMED_KEY, '1');
        set({ welcomed: true });
      },

      clearError: () => set({ error: null, resetSentTo: null }),
    };
  });
}

// First launch as a guest, or finishing an email link: show the sign-in welcome
export const needsWelcome = (s: Pick<AccountState, 'status' | 'welcomed'>) =>
  s.status === 'needs-email' || (s.status === 'signed-out' && !s.welcomed);

export const useAccount = createAccountStore({
  configured: isFirebaseConfigured,
  loadBackend: () => import('../lib/firebase').then(m => m.createFirebaseBackend()),
  game: useGame,
  storage: localStorageRepo,
  page: {
    href: () => location.href,
    origin: () => location.origin,
    replaceUrl: url => history.replaceState(null, '', url),
  },
  online: () => typeof navigator === 'undefined' || navigator.onLine !== false,
  onOnline: fn => {
    if (typeof window !== 'undefined') window.addEventListener('online', fn);
  },
  onHidden: fn => {
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && fn());
  },
});
