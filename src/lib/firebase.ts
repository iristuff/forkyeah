// The only file that talks to the Firebase SDK. It is loaded with a dynamic
// import (see src/store/accountStore.ts), so guests never download Firebase.
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
// Lite = plain REST reads/writes, a fraction of the full SDK. Progress lives on the
// device first, so we don't need Firestore's offline cache or live listeners.
import { deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import type { Progress } from '../types';
import { firebaseConfig } from './firebaseConfig';

export interface AccountUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providers: string[]; // 'google.com' | 'password' | 'emailLink'
}

// Everything the account store needs from an auth + database provider.
// Tests use a fake; swapping providers means rewriting only this file.
export interface AccountBackend {
  onUserChanged(cb: (user: AccountUser | null) => void): () => void;
  completeRedirect(): Promise<void>; // throws if a Google redirect sign-in failed
  signInWithGoogle(): Promise<void>;
  signUpWithEmail(email: string, password: string): Promise<void>;
  signInWithEmail(email: string, password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  sendEmailLink(email: string, returnUrl: string): Promise<void>;
  isEmailLink(url: string): boolean;
  completeEmailLink(email: string, url: string): Promise<void>;
  signOut(): Promise<void>;
  deleteUser(): Promise<void>;
  pullProgress(uid: string): Promise<unknown | null>;
  pushProgress(uid: string, progress: Progress, schema: number): Promise<void>;
  deleteProgress(uid: string): Promise<void>;
}

function toAccountUser(u: User): AccountUser {
  const providers = u.providerData.map(p => p.providerId);
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    emailVerified: u.emailVerified,
    providers: providers.length ? providers : ['emailLink'],
  };
}

export function createFirebaseBackend(): AccountBackend {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const userDoc = (uid: string) => doc(db, 'users', uid);

  return {
    onUserChanged: cb => onAuthStateChanged(auth, u => cb(u ? toAccountUser(u) : null)),

    async completeRedirect() {
      await getRedirectResult(auth);
    },

    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      // In production the auth domain is our own (proxied by vercel.json), so a
      // redirect works everywhere, including the installed iPhone app. Elsewhere
      // (localhost, previews) a cross-site redirect is blocked by Safari: use a popup.
      if (firebaseConfig.authDomain === location.host) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
    },

    async signUpWithEmail(email, password) {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user).catch(() => undefined); // nice to have, never blocks sign-up
    },

    async signInWithEmail(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },

    sendPasswordReset: email => sendPasswordResetEmail(auth, email),

    sendEmailLink: (email, returnUrl) => sendSignInLinkToEmail(auth, email, { url: returnUrl, handleCodeInApp: true }),

    isEmailLink: url => isSignInWithEmailLink(auth, url),

    async completeEmailLink(email, url) {
      await signInWithEmailLink(auth, email, url);
    },

    signOut: () => signOut(auth),

    async deleteUser() {
      if (auth.currentUser) await deleteUser(auth.currentUser);
    },

    async pullProgress(uid) {
      const snap = await getDoc(userDoc(uid));
      return snap.exists() ? (snap.data().progress ?? null) : null;
    },

    async pushProgress(uid, progress, schema) {
      await setDoc(userDoc(uid), { progress, schema, updatedAt: serverTimestamp() });
    },

    deleteProgress: uid => deleteDoc(userDoc(uid)),
  };
}
