import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production / Railway
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local development
  const serviceAccountPath = path.resolve("serviceAccountKey.json");
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error("serviceAccountKey.json not found locally!");
  }
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
