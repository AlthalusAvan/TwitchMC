/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from "firebase-admin";
import { TwitchUser } from "../types/twitch";

/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * @param {any} twitchUser - Twitch User object fetched from API
 * @return {Promise<string>} The Firebase custom auth token in a promise.
 */
export async function createFirebaseAccount(
  twitchUser: TwitchUser
): Promise<string> {
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
