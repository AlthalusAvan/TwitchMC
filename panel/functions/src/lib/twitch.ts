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

/**
 *
 * @param {string} userId - the ID of the user to check
 * @param {string} channelId - the ID of the Twitch channel to check against
 * @return {TwitchUser}
 */
export async function getSubscription(
  userId: string,
  channelId: string
): Promise<boolean> {
  try {
    const reqUrl = new URL("https://api.twitch.tv/helix/subscriptions/user");

    const params: { [key: string]: string } = {
      broadcaster_id: channelId,
      user_id: userId,
    };

    Object.keys(params).forEach((key) =>
      reqUrl.searchParams.append(key, params[key])
    );

    const response = await fetch(reqUrl, {
      method: "GET",
      headers: {
        "Client-Id": functions.config().twitch.client_id,
        Authorization: "Bearer " + functions.config().twitch.token,
      },
    });

    if (response.status === 200) {
      return true;
    }

    if (response.status === 404) {
      return false;
    }

    console.error(
      `Error getting subscription for user ID ${userId} to channel ${channelId} - Twitch API returned: ${await response.text()}`
    );
  } catch (error) {
    console.error(error);
  }

  return false;
}
