import * as functions from "firebase-functions";
import cookieParser = require("cookie-parser");
import crypto = require("crypto");
import { getTwitchUser, twitchOAuth2Client } from "../lib/twitch";
import { createFirebaseAccount } from "../lib/firebaseAuth";

const OAUTH_REDIRECT_URI = process.env.FUNCTIONS_EMULATOR
  ? "http://localhost:3000/login"
  : "https://twitchmc.io/login";

const OAUTH_SCOPES = "user:read:email";

/**
 * Redirects the User to the Twitch authentication consent screen. Also the 'state' cookie is set for later state
 * verification.
 * @param {functions.https.Request} req Firebase Request object
 * @param {functions.Response} res Firebase response object
 */
export function redirect(
  req: functions.https.Request,
  res: functions.Response
): void {
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
}

/**
 * Exchanges a given Twitch auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
 * The Firebase custom auth token, display name, photo URL and Twitch acces token are sent back in a send callback
 * function with function name defined by the 'callback' query parameter.
 * @param {functions.https.Request} req Firebase Request object
 * @param {functions.Response} res Firebase response object
 */
export async function token(
  req: functions.https.Request,
  res: functions.Response
): Promise<void> {
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
    if (twitchUser) {
      const firebaseToken = await createFirebaseAccount(twitchUser);

      // Serve an HTML page that signs the user in and updates the user profile.
      res.jsonp({ token: firebaseToken });
      return;
    } else {
      res.send("Twitch user not found");
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500).jsonp({ error: error });
    return;
  }
}
