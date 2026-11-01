// Shape of a player's cloud copy (Firestore `users/{uid}`) and the friendly
// messages shown when signing in fails. Pure, so it is tested without Firebase.
import type { Progress } from '../types';
import { emptyProgress } from './game';
import { dropRetiredFields, isProgress } from './progressSchema';

// Firestore rejects `undefined` values, so drop them (JSON does exactly that)
export function toCloudProgress(p: Progress): Progress {
  return JSON.parse(JSON.stringify(p)) as Progress;
}

// Cloud data is outside input: strip retired fields, fill new ones, validate
export function fromCloudProgress(data: unknown): Progress | null {
  const legacy = dropRetiredFields(data);
  if (typeof legacy !== 'object' || legacy === null) return null;
  const candidate = { ...emptyProgress(), ...legacy };
  return isProgress(candidate) ? candidate : null;
}

export function sameProgress(a: Progress, b: Progress): boolean {
  return JSON.stringify(toCloudProgress(a)) === JSON.stringify(toCloudProgress(b));
}

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/missing-email': 'Enter your email address first.',
  'auth/missing-password': 'Enter your password.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/user-not-found': 'Wrong email or password.',
  'auth/email-already-in-use': 'There’s already an account with that email. Try signing in instead.',
  'auth/weak-password': 'Pick a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
  'auth/user-disabled': 'This account has been turned off.',
  'auth/network-request-failed': 'You’re offline. Signing in needs internet.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/account-exists-with-different-credential': 'You already have an account with this email using a different sign-in method. Use that one.',
  'auth/invalid-action-code': 'That sign-in link has expired or was already used. Ask for a new one.',
  'auth/expired-action-code': 'That sign-in link has expired. Ask for a new one.',
  'auth/requires-recent-login': 'For your security, sign in again and then retry.',
  'auth/operation-not-allowed': 'That sign-in method isn’t turned on yet.',
  'auth/unauthorized-domain': 'Sign-in isn’t allowed on this web address.',
  'auth/unauthorized-continue-uri': 'Sign-in links aren’t allowed on this web address.',
  // Ours: signing out would lose progress that couldn't be saved yet
  'forkyeah/unsaved': 'Couldn’t save your latest progress, so you’re still signed in. Try again when you’re online.',
};

export function authErrorMessage(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
  return AUTH_MESSAGES[code] ?? 'Something went wrong signing in. Please try again.';
}
