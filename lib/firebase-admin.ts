import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let admin: App;

if (getApps().length === 0) {
  // Cloud Runでは Application Default Credentials を使用
  admin = initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "home-items-app",
  });
} else {
  admin = getApps()[0];
}

export { admin };
export const db = getFirestore(admin, "menu-items-db");
