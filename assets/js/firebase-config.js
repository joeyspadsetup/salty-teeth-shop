// ─────────────────────────────────────────────────────────────
// Fill these 6 values in with the ones from your Firebase project
// (Firebase Console → Project settings → Your apps → Web app → SDK setup and config).
// See SETUP.md for the full step-by-step.
// These values are not secret — they are meant to be public in client-side code.
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

export const isConfigured = firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY";
