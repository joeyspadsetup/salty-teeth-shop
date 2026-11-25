// ─────────────────────────────────────────────────────────────
// Fill these 6 values in with the ones from your Firebase project
// (Firebase Console → Project settings → Your apps → Web app → SDK setup and config).
// See SETUP.md for the full step-by-step.
// These values are not secret — they are meant to be public in client-side code.
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: "AIzaSyCehMmNdeEfqbR3pTjllGVRW1GfDLIS7VI",
  authDomain: "salty-teeth-shop.firebaseapp.com",
  projectId: "salty-teeth-shop",
  storageBucket: "salty-teeth-shop.firebasestorage.app",
  messagingSenderId: "1006097382415",
  appId: "1:1006097382415:web:a4a3abc5b84627a7c9f77a",
};

export const isConfigured = firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY";
