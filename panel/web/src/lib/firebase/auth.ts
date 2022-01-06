import {
  getAuth,
  signInWithCustomToken,
  connectAuthEmulator,
} from "firebase/auth";

export const auth = getAuth();
if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
}

export function signIn(token: string) {
  return signInWithCustomToken(auth, token);
}
