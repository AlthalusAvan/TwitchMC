import {
  getAuth,
  signInWithCustomToken,
  connectAuthEmulator,
  browserLocalPersistence,
  setPersistence,
  signOut as FireBaseSignOut,
} from "firebase/auth";
import { app } from "./app";

export const auth = getAuth(app);

if (import.meta.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
}

export function signIn(token: string) {
  return setPersistence(auth, browserLocalPersistence).then(() => {
    signInWithCustomToken(auth, token);
  });
}

export function signOut() {
  return FireBaseSignOut(auth);
}
