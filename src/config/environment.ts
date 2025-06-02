import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

export interface AppConfig {
  discordToken: string;
  hotChannelId: string;
  generalChannelId: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  messageSenderId: string;
  appId: string;
  measurementId: string;
}

/**
 * アプリケーション設定を読み込み、必須項目を検証する
 */
export function loadConfig(): AppConfig {
  const discordToken = process.env.TOKEN;
  const hotChannelId = process.env.HOT_CHANNEL_ID;
  const generalChannelId = process.env.GENERAL_CHANNEL_ID;

  if (!discordToken) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!hotChannelId) {
    throw new Error("Missing required environment variable: HOT_CHANNEL_ID");
  }

  if (!generalChannelId) {
    throw new Error("Missing required environment variable: GENERAL_CHANNEL_ID");
  }

  return {
    discordToken,
    hotChannelId,
    generalChannelId,
  };
}

/**
 * Firebase設定を読み込み、必須項目を検証する
 */
export function loadFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.FIREBASE_API_KEY;
  const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
  const messageSenderId = process.env.FIREBASE_MESSAGE_SENDER_ID;
  const appId = process.env.FIREBASE_APP_ID;
  const measurementId = process.env.FIREBASE_MEASUREMENT_ID;

  if (!apiKey) {
    throw new Error("Missing required environment variable: FIREBASE_API_KEY");
  }

  if (!authDomain) {
    throw new Error("Missing required environment variable: FIREBASE_AUTH_DOMAIN");
  }

  if (!databaseURL) {
    throw new Error("Missing required environment variable: FIREBASE_DATABASE_URL");
  }

  if (!projectId) {
    throw new Error("Missing required environment variable: FIREBASE_PROJECT_ID");
  }

  if (!storageBucket) {
    throw new Error("Missing required environment variable: FIREBASE_STORAGE_BUCKET");
  }

  if (!messagingSenderId) {
    throw new Error("Missing required environment variable: FIREBASE_MESSAGING_SENDER_ID");
  }

  if (!messageSenderId) {
    throw new Error("Missing required environment variable: FIREBASE_MESSAGE_SENDER_ID");
  }

  if (!appId) {
    throw new Error("Missing required environment variable: FIREBASE_APP_ID");
  }

  if (!measurementId) {
    throw new Error("Missing required environment variable: FIREBASE_MEASUREMENT_ID");
  }

  return {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId,
    messageSenderId,
    appId,
    measurementId,
  };
}
