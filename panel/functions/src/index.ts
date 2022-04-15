/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { redirect, token } from "./functions/auth";
import { checkAccess } from "./functions/access";
import { createServer, registerServer } from "./functions/server";

admin.initializeApp();

exports.redirect = functions.https.onRequest(redirect);
exports.token = functions.https.onRequest(token);
exports.registerServer = functions.https.onRequest(registerServer);
exports.createServer = functions.https.onCall(createServer);

exports.checkAccess = functions
  .runWith({
    // Keep 1 instance warm for this latency-critical function
    minInstances: 1,
  })
  .https.onRequest(checkAccess);
