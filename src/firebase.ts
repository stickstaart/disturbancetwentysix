import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase-configuratie uit Vite-omgevingsvariabelen (.env.local lokaal, Environment Variables op Vercel).
// Let op: in .env-bestanden KEY=waarde, zonder aanhalingstekens of komma's.
// Online loopt de Google-login via ons eigen domein: vercel.json stuurt /__/auth door naar Firebase.
// Anders blokkeert Safari (iPhone) de login, omdat de pagina en firebaseapp.com hun opslag niet mogen delen.
// Lokaal (npm run dev) is er geen doorstuurregel, dus daar het standaard firebaseapp-domein.
function authDomain() {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  return host && host !== "localhost" && host !== "127.0.0.1" ? window.location.host : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: authDomain(),
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
// Alleen met geldige configuratie: getAuth crasht bij een ongeldige key al tijdens het importeren.
export const auth = isFirebaseConfigured ? getAuth(app) : null;
