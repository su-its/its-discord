import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { type FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
//TODO: コンフィグの読み込みを分離 https://github.com/su-its/its-discord/issues/16
import serviceAccount from "../../its-discord-auth-firebase-adminsdk-wn2uo-ac781d8325.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

dotenv.config(); // 環境変数をロード

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  messageSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const adminAuth = admin.auth();
export const auth = getAuth(app);
