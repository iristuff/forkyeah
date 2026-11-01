import { describe, expect, it, vi } from 'vitest';
import type { AccountBackend, AccountUser } from '../lib/firebase';
import { emptyProgress } from '../lib/game';
import type { Progress } from '../types';
import { createAccountStore, EMAIL_KEY, needsWelcome, OWNER_KEY, WELCOMED_KEY } from './accountStore';
import { createGameStore } from './gameStore';
import { memoryRepo } from './progressRepo';

const NOW = new Date(2026, 9, 1, 18, 0);
const ORIGIN = 'https://forkyeah-app.vercel.app';

// In-memory stand-in for Firebase Auth + Firestore
function fakeFirebase(docs = new Map<string, unknown>()) {
  let current: AccountUser | null = null;
  let listener: ((u: AccountUser | null) => void) | undefined;
  const flags = { offline: false, needsRecentLogin: false, slowDelete: false };
  const user = (uid: string): AccountUser => ({ uid, email: `${uid}@example.com`, displayName: null, photoURL: null, emailVerified: true, providers: ['password'] });
  const login = (uid: string) => {
    current = user(uid);
    listener?.(current);
  };
  const net = () => {
    if (flags.offline) throw { code: 'auth/network-request-failed' };
  };
  const backend: AccountBackend = {
    onUserChanged(cb) {
      listener = cb;
      queueMicrotask(() => cb(current));
      return () => undefined;
    },
    completeRedirect: async () => undefined,
    signInWithGoogle: async () => login('google-user'),
    signUpWithEmail: async email => login(email),
    signInWithEmail: async (email, password) => {
      if (password !== 'right') throw { code: 'auth/invalid-credential' };
      login(email);
    },
    sendPasswordReset: async () => undefined,
    sendEmailLink: async () => undefined,
    isEmailLink: url => url.includes('oobCode='),
    completeEmailLink: async (email, link) => {
      if (!link.includes('oobCode=')) throw { code: 'auth/invalid-action-code' };
      login(email);
    },
    signOut: async () => {
      current = null;
      listener?.(null);
    },
    deleteUser: async () => {
      if (flags.needsRecentLogin) throw { code: 'auth/requires-recent-login' };
      if (flags.slowDelete) await new Promise(r => setTimeout(r, 30));
      current = null;
      listener?.(null);
    },
    pullProgress: async uid => {
      net();
      return docs.get(uid) ?? null;
    },
    pushProgress: async (uid, progress) => {
      net();
      docs.set(uid, JSON.parse(JSON.stringify(progress)));
    },
    deleteProgress: async uid => void docs.delete(uid),
  };
  return { backend, docs, flags, signInAs: login };
}

function setup(opts: { configured?: boolean; storage?: Record<string, string>; href?: string; docs?: Map<string, unknown>; local?: Progress } = {}) {
  const fb = fakeFirebase(opts.docs);
  const storage = memoryRepo(opts.storage);
  const game = createGameStore(memoryRepo());
  if (opts.local) game.getState().replaceProgress(opts.local);
  let href = opts.href ?? `${ORIGIN}/`;
  let online = true;
  const onlineFns: (() => void)[] = [];
  const loadBackend = vi.fn(async () => fb.backend);
  const account = createAccountStore({
    configured: opts.configured ?? true,
    loadBackend,
    game,
    storage,
    page: { href: () => href, origin: () => ORIGIN, replaceUrl: url => (href = url) },
    online: () => online,
    onOnline: fn => void onlineFns.push(fn),
    onHidden: () => undefined,
    saveDelayMs: 5,
  });
  const cloudXP = (uid: string) => (fb.docs.get(uid) as Progress | undefined)?.xp;
  const goOnline = () => {
    online = true;
    fb.flags.offline = false;
    onlineFns.forEach(fn => fn());
  };
  const goOffline = () => {
    online = false;
    fb.flags.offline = true;
  };
  const visit = (url: string) => void (href = url); // e.g. the router redirecting
  return { fb, storage, game, account, loadBackend, cloudXP, goOnline, goOffline, href: () => href, visit };
}

const synced = (s: ReturnType<typeof setup>) => vi.waitFor(() => expect(s.account.getState().sync).toBe('synced'));
const withXP = (xp: number): Progress => ({ ...emptyProgress(), xp });

describe('account store', () => {
  it('stays guest-only when Firebase isn’t configured', () => {
    const s = setup({ configured: false });
    s.account.getState().start();
    expect(s.account.getState().status).toBe('disabled');
    expect(s.loadBackend).not.toHaveBeenCalled();
  });

  it('never downloads Firebase for a guest', () => {
    const s = setup();
    s.account.getState().start();
    expect(s.account.getState().status).toBe('signed-out');
    expect(s.loadBackend).not.toHaveBeenCalled();
  });

  it('uploads guest progress on first sign-in', async () => {
    const s = setup({ local: withXP(120) });
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await synced(s);
    expect(s.account.getState().status).toBe('signed-in');
    expect(s.cloudXP('iris@example.com')).toBe(120);
    expect(s.storage.getItem(OWNER_KEY)).toBe('iris@example.com');
  });

  it('brings cloud progress to a new device, merged with what was played there', async () => {
    const docs = new Map<string, unknown>([['google-user', { ...withXP(500), stamps: { japan: NOW.toISOString() } }]]);
    const s = setup({ docs });
    s.game.getState().completeStep('green-curry', 0, NOW);
    s.account.getState().start();
    await s.account.getState().signInWithGoogle();
    await synced(s);
    const p = s.game.getState().progress;
    expect(p.xp).toBe(500);
    expect(p.stamps.japan).toBeDefined();
    expect(p.dishes['green-curry'].stepsDone).toEqual([0]);
    expect((docs.get('google-user') as Progress).dishes['green-curry']).toBeDefined();
  });

  it('never merges progress that belongs to a different account', async () => {
    const docs = new Map<string, unknown>([['bob', withXP(10)]]);
    const s = setup({ docs, storage: { [OWNER_KEY]: 'alice' }, local: withXP(900) });
    s.account.getState().start();
    s.fb.signInAs('bob');
    await synced(s);
    expect(s.game.getState().progress.xp).toBe(10);
    expect(s.cloudXP('bob')).toBe(10);
  });

  it('greets a new account by name, but keeps a name the player chose', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris.le@example.com', 'right');
    await synced(s);
    expect(s.game.getState().progress.profile.name).toBe('Iris');
    expect((s.fb.docs.get('iris.le@example.com') as Progress).profile.name).toBe('Iris');

    const chosen = setup({ local: { ...emptyProgress(), profile: { name: 'Bao', emoji: '🍜' } } });
    chosen.account.getState().start();
    await chosen.account.getState().signInWithEmail('iris.le@example.com', 'right');
    await synced(chosen);
    expect(chosen.game.getState().progress.profile.name).toBe('Bao');
  });

  it('saves changes to the cloud shortly after they happen', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signUpWithEmail(' new@example.com ', 'secret1');
    await synced(s);
    s.game.getState().completeStep('miso-soup', 0, NOW);
    await vi.waitFor(() => expect(s.cloudXP('new@example.com')).toBe(10));
  });

  it('keeps changes made offline and saves them when back online', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await synced(s);
    s.goOffline();
    s.game.getState().completeStep('miso-soup', 0, NOW);
    await vi.waitFor(() => expect(s.account.getState().sync).toBe('offline'));
    expect(s.cloudXP('iris@example.com')).toBe(0);
    s.goOnline();
    await vi.waitFor(() => expect(s.cloudXP('iris@example.com')).toBe(10));
  });

  it('restores the session and syncs on app start', async () => {
    const docs = new Map<string, unknown>([['iris', withXP(300)]]);
    const s = setup({ docs, storage: { [OWNER_KEY]: 'iris' }, local: withXP(200) });
    s.fb.signInAs('iris'); // Firebase remembers the session
    s.account.getState().start();
    expect(s.loadBackend).toHaveBeenCalled();
    await synced(s);
    expect(s.game.getState().progress.xp).toBe(300);
  });

  it('signs out to a fresh guest, but not while progress is unsaved', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await synced(s);

    s.goOffline();
    s.game.getState().completeStep('miso-soup', 0, NOW);
    await vi.waitFor(() => expect(s.account.getState().sync).toBe('offline'));
    await s.account.getState().signOut();
    expect(s.account.getState().status).toBe('signed-in');
    expect(s.account.getState().error).toMatch(/offline/);

    s.goOnline();
    await vi.waitFor(() => expect(s.cloudXP('iris@example.com')).toBe(10));
    await s.account.getState().signOut();
    expect(s.account.getState().status).toBe('signed-out');
    expect(s.game.getState().progress).toEqual(emptyProgress());
    expect(s.storage.getItem(OWNER_KEY)).toBeNull();
  });

  it('retries a failed first sync when signing out, instead of refusing forever', async () => {
    const s = setup();
    s.account.getState().start();
    s.fb.flags.offline = true; // Firestore fails while the device still says it's online
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await vi.waitFor(() => expect(s.account.getState().sync).toBe('error'));

    s.fb.flags.offline = false;
    await s.account.getState().signOut();
    expect(s.account.getState().status).toBe('signed-out');
  });

  it('shows friendly errors and clears them', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'wrong');
    expect(s.account.getState().error).toBe('Wrong email or password.');
    expect(s.account.getState().busy).toBe(false);
    s.account.getState().clearError();
    expect(s.account.getState().error).toBeNull();
  });

  it('deletes the account and its data, or keeps both if Firebase needs a fresh sign-in', async () => {
    const s = setup({ local: withXP(50) });
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await synced(s);

    s.fb.flags.needsRecentLogin = true;
    await s.account.getState().deleteAccount();
    expect(s.account.getState().error).toMatch(/sign in again/);
    expect(s.cloudXP('iris@example.com')).toBe(50);

    s.fb.flags.needsRecentLogin = false;
    await s.account.getState().deleteAccount();
    expect(s.fb.docs.has('iris@example.com')).toBe(false);
    expect(s.account.getState().status).toBe('signed-out');
    expect(s.game.getState().progress.xp).toBe(0);
  });

  it('never lets a pending save recreate the data while deleting', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await synced(s);

    s.fb.flags.slowDelete = true;
    s.game.getState().completeStep('miso-soup', 0, NOW); // schedules a save
    await s.account.getState().deleteAccount();
    await new Promise(r => setTimeout(r, 20));
    expect(s.fb.docs.has('iris@example.com')).toBe(false);
  });

  it('finishes an email sign-in link and cleans the address bar', async () => {
    const link = `${ORIGIN}/profile?apiKey=k&oobCode=abc&mode=signIn&lang=en`;
    const s = setup({ href: link, storage: { [EMAIL_KEY]: 'iris@example.com' } });
    s.account.getState().start();
    await synced(s);
    expect(s.account.getState().user?.uid).toBe('iris@example.com');
    expect(s.href()).toBe(`${ORIGIN}/profile`);
    expect(s.storage.getItem(EMAIL_KEY)).toBeNull();
  });

  it('asks for the email again when a sign-in link is opened on another device', async () => {
    const s = setup({ href: `${ORIGIN}/profile?oobCode=abc&mode=signIn` });
    s.account.getState().start();
    await vi.waitFor(() => expect(s.account.getState().status).toBe('needs-email'));
    s.visit(`${ORIGIN}/welcome`); // the welcome redirect drops the link's code from the address bar
    await s.account.getState().completeEmailLink('iris@example.com');
    await synced(s);
    expect(s.account.getState().status).toBe('signed-in');
  });

  it('remembers the email when sending a sign-in link', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().sendEmailLink(' iris@example.com ');
    expect(s.account.getState().emailLinkSentTo).toBe('iris@example.com');
    expect(s.storage.getItem(EMAIL_KEY)).toBe('iris@example.com');
  });

  it('confirms a password reset email, and forgets it when the form changes', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().sendPasswordReset(' iris@example.com ');
    expect(s.account.getState().resetSentTo).toBe('iris@example.com');
    s.account.getState().clearError();
    expect(s.account.getState().resetSentTo).toBeNull();
  });

  it('welcomes a new guest once, until they choose to stay a guest', () => {
    const s = setup();
    s.account.getState().start();
    expect(needsWelcome(s.account.getState())).toBe(true);
    s.account.getState().finishWelcome();
    expect(needsWelcome(s.account.getState())).toBe(false);
    expect(s.storage.getItem(WELCOMED_KEY)).toBe('1');
    expect(setup({ storage: { [WELCOMED_KEY]: '1' } }).account.getState().welcomed).toBe(true);
  });

  it('never welcomes a signed-in player, or anyone when accounts are off', async () => {
    const s = setup();
    s.account.getState().start();
    await s.account.getState().signInWithEmail('iris@example.com', 'right');
    await synced(s);
    expect(s.account.getState().welcomed).toBe(true);
    await s.account.getState().signOut();
    expect(needsWelcome(s.account.getState())).toBe(false);

    const off = setup({ configured: false });
    off.account.getState().start();
    expect(needsWelcome(off.account.getState())).toBe(false);
  });

  it('can give up on a sign-in link opened on another device', async () => {
    const s = setup({ href: `${ORIGIN}/profile?mode=signIn&oobCode=abc` });
    s.account.getState().start();
    await vi.waitFor(() => expect(s.account.getState().status).toBe('needs-email'));
    s.account.getState().cancelEmailLink();
    expect(s.account.getState().status).toBe('signed-out');
    expect(s.href()).toBe(`${ORIGIN}/profile`);
  });

  it('welcomes back to finish a sign-in link opened on another device', () => {
    expect(needsWelcome({ status: 'needs-email', welcomed: true })).toBe(true);
    expect(needsWelcome({ status: 'loading', welcomed: false })).toBe(false);
  });
});
