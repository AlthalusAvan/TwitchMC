import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import crypto = require("crypto");
import { getSubscription } from "../lib/twitch";

/**
 * Queries to see if a user is currently subscribed to the owner of the server
 * If yes, responds with access: true and a TTL for caching purposes
 * If no, responds with with access: false and a reason to allow for different behaviour based on whether the user has previously been registered
 * @param {functions.https.Request} req Firebase Request object
 * @param {functions.Response} res Firebase response object
 */
export async function checkAccess(
  req: functions.https.Request,
  res: functions.Response
): Promise<void> {
  const serverId = req.body.serverId;
  if (!serverId) {
    res.send({
      access: false,
      error: "SERVER_ID_MISSING",
      description: "Please provide a valid Server ID",
    });
    return;
  }

  const db = admin.firestore();
  const serversRef = db.collection("servers");
  const server = await serversRef.doc(serverId).get();

  if (!server.exists) {
    res.send({
      access: false,
      error: "INVALID_SERVER",
      description: "There is no server registered with the provided ID",
    });
    return;
  }

  const uuid = req.body.uuid;
  if (!uuid) {
    res.send({
      access: false,
      error: "UUID_MISSING",
      description: "Please provide a valid UUID",
    });
    return;
  }

  const usersRef = db.collection("users");
  const userQuery = await usersRef.where("uuid", "==", uuid).get();

  if (userQuery.empty) {
    const verificationsRef = db.collection("userVerifications");

    const existingVerificationQuery = await verificationsRef
      .where("uuid", "==", uuid)
      .get();

    if (!existingVerificationQuery.empty) {
      const existingVerification = existingVerificationQuery.docs[0];

      res.send({
        access: false,
        linked: false,
        code: existingVerification.id,
      });
      return;
    }

    let docExists = true;
    let code = "";

    while (docExists) {
      code = crypto.randomBytes(3).toString("hex").toUpperCase();
      const codeDoc = await verificationsRef.doc(code).get();

      if (!codeDoc.exists) {
        docExists = false;
      }
    }

    verificationsRef.doc(code).set({ uuid: uuid });

    res.send({
      access: false,
      linked: false,
      code: code,
    });
    return;
  }

  const userData = userQuery.docs[0].data();
  const serverData = server.data();

  if (!serverData) {
    res.send({
      access: false,
      error: "INVALID_SERVER",
      description:
        "The server object is malformed, please contact a TwitchMC Admin",
    });
    return;
  }

  const userHasAccess = await getSubscription(
    userData.id,
    serverData.user.split(":")[1]
  );

  if (!serverData.uuids || !serverData.uuids.includes("uuid")) {
    const uuids = serverData.uuids;
    uuids.push(uuid);

    serversRef.doc(serverId).update({
      uuids: uuids,
      playersManaged: serverData.playersManaged + 1,
    });
  }

  res.send({
    access: userHasAccess,
    linked: true,
  });
}
