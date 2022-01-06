/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cookieParser = require("cookie-parser");
import crypto = require("crypto");
import { AuthorizationCode, ModuleOptions, Token } from "simple-oauth2";
import fetch from "node-fetch";

const OAUTH_REDIRECT_URI = process.env.FUNCTIONS_EMULATOR
  ? "http://localhost:3000/login"
  : "https://twitchmc.io/login";
const OAUTH_SCOPES = "user:read:email";

admin.initializeApp();

/**
 * Get a Twitch auth code
 * @return {AuthorizationCode}
 */
function twitchOAuth2Client() {
  // Twitch OAuth 2 setup
  const credentials: ModuleOptions = {
    client: {
      id: functions.config().twitch.client_id,
      secret: functions.config().twitch.client_secret,
    },
    auth: {
      tokenHost: "https://id.twitch.tv",
      tokenPath: "/oauth2/token",
      authorizePath: "/oauth2/authorize",
    },
    options: {
      bodyFormat: "json",
      authorizationMethod: "body",
    },
  };

  return new AuthorizationCode(credentials);
}

/**
 * Redirects the User to the Twitch authentication consent screen. Also the 'state' cookie is set for later state
 * verification.
 */
exports.redirect = functions.https.onRequest((req, res) => {
  const authorizationCode = twitchOAuth2Client();

  cookieParser()(req, res, () => {
    const state =
      req.cookies.__session || crypto.randomBytes(20).toString("hex");
    res.cookie("__session", state.toString(), {
      maxAge: 3600000,
      httpOnly: true,
    });
    const redirectUri = authorizationCode.authorizeURL({
      client_id: functions.config().twitch.client_id,
      redirect_uri: OAUTH_REDIRECT_URI,
      scope: OAUTH_SCOPES,
      state: state,
    });
    res.redirect(redirectUri);
  });
});

/**
 * Exchanges a given Twitch auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
 * The Firebase custom auth token, display name, photo URL and Twitch acces token are sent back in a send callback
 * function with function name defined by the 'callback' query parameter.
 */
exports.token = functions.https.onRequest(async (req, res) => {
  const authorizationCode = twitchOAuth2Client();
  res.set({ "Access-Control-Allow-Origin": "*" });

  try {
    if (!req.query.state) {
      throw new Error("State validation failed");
    }

    const options = {
      code: req.query.code?.toString() || "",
      grant_type: "authorization_code",
      redirect_uri: OAUTH_REDIRECT_URI,
    };

    const accessToken = await authorizationCode.getToken(options);

    const twitchUser = await getTwitchUser(accessToken.token);

    // Create a Firebase account and get the Custom Auth Token.
    const firebaseToken = await createFirebaseAccount(twitchUser);

    // Serve an HTML page that signs the user in and updates the user profile.
    res.jsonp({ token: firebaseToken });
    return;
  } catch (error) {
    console.error(error);
    res.sendStatus(500).jsonp({ error: error });
    return;
  }
});

/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * @param {any} twitchUser - Twitch User object fetched from API
 * @return {Promise<string>} The Firebase custom auth token in a promise.
 */
async function createFirebaseAccount(twitchUser: any) {
  // The UID we'll assign to the user.
  const uid = `twitch:${twitchUser.id}`;

  // Save the access token to the Firebase Database.
  const db = admin.firestore();
  const databaseTask = db.collection("users").doc(uid).set(twitchUser);

  // Create or update the user account.
  const userCreationTask = admin
    .auth()
    .updateUser(uid, {
      displayName: twitchUser["display_name"],
      photoURL: twitchUser["profile_image_url"],
      email: twitchUser["email"],
    })
    .catch((error) => {
      // If user does not exists we create it.
      if (error.code === "auth/user-not-found") {
        return admin.auth().createUser({
          uid: uid,
          displayName: twitchUser["display_name"],
          photoURL: twitchUser["profile_image_url"],
          email: twitchUser["email"],
        });
      }
      throw error;
    });

  // Wait for all async task to complete then generate and return a custom auth token.
  await Promise.all([userCreationTask, databaseTask]);
  // Create a Firebase custom auth token.
  const token = await admin.auth().createCustomToken(uid);
  return token;
}

/**
 *
 * @param {Token} accessToken
 * @return {TwitchUser}
 */
async function getTwitchUser(accessToken: Token) {
  try {
    const response = await fetch("https://api.twitch.tv/helix/users", {
      method: "GET",
      headers: {
        "Client-Id": functions.config().twitch.client_id,
        Authorization: "Bearer " + accessToken.access_token,
      },
    });

    const data: any = await response.json();

    return { ...data.data[0], access_token: accessToken };
  } catch (error) {
    console.error(error);
  }
}

export const checkAccess = functions.https.onRequest((request, response) => {
  response.send({
    access: false,
    linked: false,
    code: crypto.randomBytes(3).toString("hex").toUpperCase(),
  });
});
