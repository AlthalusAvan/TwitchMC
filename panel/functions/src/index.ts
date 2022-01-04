import * as functions from "firebase-functions";
import crypto = require("crypto");

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const checkAccess = functions.https.onRequest((request, response) => {
  response.send({
    access: false,
    linked: false,
    code: crypto.randomBytes(3).toString("hex").toUpperCase(),
  });
});
