// Inloggen voor de band-agenda: Google-account via Firebase Auth.
// Alleen de e-mailadressen hieronder komen binnen; dezelfde lijst staat in firestore.rules,
// dus wie hier niet op staat kan ook buiten de app om niets lezen of schrijven.
import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth } from "../firebase";

/** E-mailadres -> naam zoals in BAND_MEMBERS (zie dashboard/constants.ts) */
export const MEMBER_BY_EMAIL: Record<string, string> = {
  "jzvndk@gmail.com": "Joz (Superadmin)",
  "jostealer@gmail.com": "Jona",
  "rehemerik@gmail.com": "Rob",
  "makkingaij@gmail.com": "Johnny",
};

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut"; error?: string }
  | { status: "denied"; email: string }
  | { status: "ok"; email: string; member: string };

const memberFor = (user: User | null) => (user?.email ? MEMBER_BY_EMAIL[user.email.toLowerCase()] : undefined);

export function useBandAuth() {
  const [state, setState] = useState<AuthState>(() => (auth ? { status: "loading" } : { status: "signedOut", error: "Firebase is niet geconfigureerd." }));

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
      if (!user) return setState((prev) => (prev.status === "denied" ? prev : { status: "signedOut" }));
      const member = memberFor(user);
      if (member && user.emailVerified) setState({ status: "ok", email: user.email!, member });
      else {
        // Niet op de lijst: meteen weer uitloggen, maar laten zien met welk adres het geprobeerd is
        setState({ status: "denied", email: user.email ?? "onbekend" });
        void signOut(auth!);
      }
    });
  }, []);

  const signIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      setState({ status: "signedOut", error: code === "auth/unauthorized-domain"
        ? "Dit domein staat nog niet bij Firebase Auth → Authorized domains."
        : (e as Error).message });
    }
  };

  const logOut = async () => {
    setState({ status: "signedOut" });
    if (auth) await signOut(auth);
  };

  return { state, signIn, logOut };
}
