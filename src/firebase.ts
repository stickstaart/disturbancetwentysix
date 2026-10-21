import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase-configuratie uit Vite-omgevingsvariabelen (.env.local lokaal, Environment Variables op Vercel).
// Let op: in .env-bestanden KEY=waarde, zonder aanhalingstekens of komma's.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** false als de omgevingsvariabelen ontbreken (bijv. niet ingesteld voor deze Vercel-omgeving) */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isFirebaseConfigured) {
  // Geen crash (wit scherm) maar een duidelijke melding: de website valt terug op het archief,
  // de agenda toont een synchronisatiefout.
  console.error(
    "[firebase] VITE_FIREBASE_* ontbreken in deze build. Stel ze in (lokaal .env.local, op Vercel per omgeving) en bouw opnieuw.",
  );
}

// Voorkom dubbele initialisatie bij Hot Reloading.
// Zonder configuratie een placeholder-project, zodat importeren nooit crasht (verzoeken falen dan netjes).
const app = !getApps().length
  ? initializeApp(isFirebaseConfigured ? firebaseConfig : { projectId: "missing-config", apiKey: "missing-config" })
  : getApp();

export const db = getFirestore(app);
// Auth volgt bij de echte inlog per bandlid (getAuth crasht bij een ongeldige key al tijdens het importeren).
