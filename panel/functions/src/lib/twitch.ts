/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import { AuthorizationCode, ModuleOptions, Token } from "simple-oauth2";
import fetch from "node-fetch";
import { TwitchUser } from "../types/twitch";

/**
 * Get a Twitch auth code
 * @return {AuthorizationCode}
 */
export function twitchOAuth2Client(): AuthorizationCode {
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
 *
 * @param {Token} accessToken
 * @return {TwitchUser}
 */
export async function getTwitchUser(
  accessToken: Token
): Promise<TwitchUser | false> {
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
    return false;
  }
}
