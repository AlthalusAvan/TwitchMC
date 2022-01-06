// Initialise Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyA4dXf5A-bxzQ0sEPY3LoJcnSkTj0yaoM4",
  authDomain: "twitch-mc.firebaseapp.com",
  projectId: "twitch-mc",
  storageBucket: "twitch-mc.appspot.com",
  messagingSenderId: "919806146146",
  appId: "1:919806146146:web:dac67e3443c736957c433b",
  measurementId: "G-XZ71J8Z781",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Le4ju8dAAAAAI3nfQfBJgubsKKRxmaw8IsQ8G5r"),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});
