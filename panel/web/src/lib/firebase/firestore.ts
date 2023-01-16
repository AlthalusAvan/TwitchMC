import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app } from "./app";

export const db = getFirestore(app);
if (import.meta.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 8080);
}
