/**
 * Firebase Admin SDK initialization module
 *
 * This module handles the initialization of Firebase Admin SDK for server-side
 * operations. It sets up authentication and Firestore database connections.
 */
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

/**
 * Retrieves Firebase configuration from service account file
 *
 * @returns {AppOptions} Firebase application configuration object
 * @throws {Error} If service account file is missing
 */
const getFirebaseConfig = (): AppOptions => {
  // Path to service account JSON file
  const serviceAccountPath = path.join(
    __dirname,
    "../../config/serviceAccount.json"
  );

  try {
    // Use cert with the path to service account file
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

/**
 * Initializes Firebase Admin SDK if not already initialized
 *
 * This function implements the singleton pattern to ensure only
 * one Firebase app instance is created.
 *
 * @returns {App} Firebase Admin app instance
 */
const initializeFirebaseAdmin = (): App => {
  // Check if an app is already initialized
  const existingApp: App = getApps()[0];
  if (existingApp) {
    console.log("✅ Firebase Admin SDK already initialized");
    return existingApp;
  }

  console.log("🔥 Initializing Firebase Admin SDK...");
  const app = initializeApp(getFirebaseConfig());
  console.log("✅ Firebase Admin SDK initialized successfully");
  return app;
};

// Initialize the Firebase Admin app
const app: App = initializeFirebaseAdmin();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth, initializeFirebaseAdmin };
