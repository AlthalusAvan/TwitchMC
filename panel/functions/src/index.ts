/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { redirect, token } from "./functions/auth";
import { checkAccess } from "./functions/access";

admin.initializeApp();

exports.redirect = functions.https.onRequest(redirect);
exports.token = functions.https.onRequest(token);
exports.checkAccess = functions.https.onRequest(checkAccess);
