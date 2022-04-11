import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import crypto = require("crypto");
import { firestore } from "firebase-admin";
import { MCServer } from "../types/server";

/**
 * Verifies a server's connection - takes in the server's IP address and the user-provided verification code, and returns the auth code to the server for future requests
 * @param {functions.https.Request} req Firebase Request object
 * @param {functions.Response} res Firebase response object
 */
export async function registerServer(
  req: functions.https.Request,
  res: functions.Response
): Promise<void> {
  const code: string | null = req.body.code;

  if (!code) {
    res.jsonp({
      error: {
        code: "CODE_MISSING",
        description: "Verification code not supplied",
      },
    });

    return;
  }

  const db = admin.firestore();
  const serversRef = db.collection("servers");
  const serverQuerySnapshot = await serversRef.where("code", "==", code).get();

  if (serverQuerySnapshot.empty) {
    res.jsonp({
      error: {
        code: "CODE_NOT_FOUND",
        description: "Verification code invalid",
      },
    });

    return;
  }

  try {
    const server = serverQuerySnapshot.docs[0];
    const docRef = serversRef.doc(server.id);
    const serverData = server.data();

    serverData.status = "verified";
    delete serverData["code"];

    await docRef.set({ ...serverData });

    res.jsonp({
      ...serverData,
      id: server.id,
    });
  } catch (error) {
    res.jsonp({
      error: {
        code: "SERVER_ERROR",
        description: "Unknown error with server setup, please try again",
      },
    });

    return;
  }

  return;
}

/**
 * Creates a new server, allowing a user to verify it with the system
 * @param {unknown} data Data object - anyything we pass in from the client. This is going to be empty.
 * @param {functions.https.CallableContext} context Firebase context object - auth etc.
 */
export async function createServer(
  data: { name: string },
  context: functions.https.CallableContext
): Promise<unknown> {
  const user = context.auth;

  if (!user) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You are not authenticated"
    );
  }

  const name = data.name;

  if (!name) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Please provide a server name"
    );
  }

  const code = crypto.randomBytes(3).toString("hex").toUpperCase();

  if (!code) {
    throw new functions.https.HttpsError(
      "internal",
      "Error generating code for server registration"
    );
  }

  const db = admin.firestore();
  const serversRef = db.collection("servers");

  const serverData: MCServer = {
    code: code,
    name: name,
    user: user.uid,
    createdAt: firestore.Timestamp.now(),
    status: "Awaiting Verification",
    playersManaged: 0,
  };

  const res = await serversRef.add(serverData).catch((error) => {
    throw new functions.https.HttpsError(
      "internal",
      "Error creating server record: " + error.toString()
    );
  });

  return (await res.get()).data();
}
