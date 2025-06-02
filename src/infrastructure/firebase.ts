import * as admin from "firebase-admin";
import { type FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { loadFirebaseConfig } from "../config/environment";
import serviceAccount from "../../its-discord-auth-firebase-adminsdk-wn2uo-ac781d8325.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const firebaseConfig = loadFirebaseConfig();

const app: FirebaseApp = initializeApp(firebaseConfig);

export const firebaseAuthService = admin.auth();
export const auth = getAuth(app);
