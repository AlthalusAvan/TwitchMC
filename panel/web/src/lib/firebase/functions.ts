import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { app } from "./app";

export function getApiBaseUrl() {
  if (import.meta.env.DEV) return "http://localhost:5001/twitch-mc/us-central1";
  else return `https://twitchmc.io/api`;
}

export const functions = getFunctions(app);

if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}
