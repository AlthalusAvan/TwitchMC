import * as functions from "firebase-functions";
import crypto = require("crypto");

/**
 * Queries to see if a user is currently subscribed to the owner of the server
 * If yes, responds with access: true and a TTL for caching purposes
 * If no, responds with with access: false and a reason to allow for different behaviour based on whether the user has previously been registered
 * @param {functions.https.Request} req Firebase Request object
 * @param {functions.Response} res Firebase response object
 */
export function checkAccess(
  req: functions.https.Request,
  res: functions.Response
): void {
  res.send({
    access: false,
    linked: false,
    code: crypto.randomBytes(3).toString("hex").toUpperCase(),
  });
}
