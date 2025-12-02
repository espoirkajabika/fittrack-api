import {
  initializeApp,
  cert,
  getApps,
  App,
  AppOptions,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import * as path from "path";

const getFirebaseConfig = (): AppOptions => {
  const serviceAccountPath = path.join(
    __dirname,
    "../../config/serviceAccount.json"
  );

  try {
    return {
      credential: cert(serviceAccountPath),
    };
  } catch (error) {
    throw new Error(
      `Failed to load Firebase service account from ${serviceAccountPath}. ` +
      `Please ensure config/serviceAccount.json exists. ` +
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

const initializeFirebaseAdmin = (): App => {
  const existingApp: App = getApps()[0];
  if (existingApp) {
    console.log("Firebase Admin SDK already initialized");
    return existingApp;
  }

  console.log("Initializing Firebase Admin SDK...");
  const app = initializeApp(getFirebaseConfig());
  console.log("Firebase Admin SDK initialized successfully");
  return app;
};

// Initialize the Firebase Admin app
const app: App = initializeFirebaseAdmin();
const db: Firestore = getFirestore(app);

// ADD THIS LINE - Ignore undefined properties when saving to Firestore
db.settings({ ignoreUndefinedProperties: true });

const auth: Auth = getAuth(app);

export { db, auth, initializeFirebaseAdmin };
