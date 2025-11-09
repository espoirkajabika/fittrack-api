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
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import * as path from "path";
import * as fs from "fs";

/**
 * Loads and validates Firebase service account credentials
 *
 * @returns {object} Service account credentials object
 * @throws {Error} If service account file is missing or invalid
 */
const getServiceAccount = (): object => {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH is not defined in environment variables"
    );
  }

  // Resolve the path relative to the project root
  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Firebase service account file not found at: ${absolutePath}\n` +
      "Please ensure the file exists and the path in .env is correct."
    );
  }

  try {
    // Read and parse the service account JSON file
    const serviceAccountFile = fs.readFileSync(absolutePath, "utf8");
    const serviceAccount = JSON.parse(serviceAccountFile);

    // Validate required fields
    const requiredFields = ["project_id", "private_key", "client_email"];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Service account JSON is missing required fields: ${missingFields.join(", ")}`
      );
    }

    return serviceAccount;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON in service account file: ${absolutePath}\n` +
        "Please ensure the file contains valid JSON."
      );
    }
    throw error;
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
    console.log("Using existing Firebase Admin app");
    return existingApp;
  }

  // Load service account and initialize new app
  const serviceAccount = getServiceAccount();
  
  console.log(" Initializing Firebase Admin SDK...");
  const app = initializeApp({
    credential: cert(serviceAccount as any),
  });
  
  console.log(" Firebase Admin SDK initialized successfully");
  return app;
};

// Initialize the Firebase Admin app
const app: App = initializeFirebaseAdmin();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth };
