// Firebase web config from VITE_FIREBASE_* env vars. Kept apart from firebase.ts
// so checking it never pulls the Firebase SDK into the main bundle.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

// Builds without the env vars (CI verify, forks) just run in guest-only mode
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
