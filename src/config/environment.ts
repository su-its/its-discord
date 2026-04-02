import dotenv from "dotenv";

// dotenv v17 は自動的に .env を読み込む
// .env.local を使う場合は main.local.ts で先に読み込む
dotenv.config();

export type Environment = "production" | "local";

export type AdapterType = "production" | "in-memory";

export interface AdapterConfig {
  itsCore: AdapterType;
  emailAuth: AdapterType;
}

export interface AppConfig {
  environment: Environment;
  discordToken: string;
  hotChannelId: string;
  generalChannelId: string;
  authRedirectUrl: string;
  adapters: AdapterConfig;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  messageSenderId: string;
  appId: string;
  measurementId: string;
}

export interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function loadAdapterConfig(environment: Environment): AdapterConfig {
  if (environment === "production") {
    return { itsCore: "production", emailAuth: "production" };
  }

  return {
    itsCore: parseAdapterType(process.env.ITSCORE_ADAPTER, "in-memory"),
    emailAuth: parseAdapterType(process.env.EMAIL_AUTH_ADAPTER, "in-memory"),
  };
}

function parseAdapterType(
  value: string | undefined,
  defaultValue: AdapterType,
): AdapterType {
  if (value === "production" || value === "in-memory") return value;
  return defaultValue;
}

/**
 * アプリケーション設定を読み込み、必須項目を検証する
 */
export function loadConfig(): AppConfig {
  const environment = (process.env.ENVIRONMENT ?? "production") as Environment;
  const discordToken = process.env.TOKEN;
  const hotChannelId = process.env.HOT_CHANNEL_ID;
  const generalChannelId = process.env.GENERAL_CHANNEL_ID;
  const authRedirectUrl = process.env.AUTH_REDIRECT_URL;

  if (!discordToken) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!hotChannelId) {
    throw new Error("Missing required environment variable: HOT_CHANNEL_ID");
  }

  if (!generalChannelId) {
    throw new Error(
      "Missing required environment variable: GENERAL_CHANNEL_ID",
    );
  }

  if (!authRedirectUrl) {
    throw new Error("Missing required environment variable: AUTH_REDIRECT_URL");
  }

  return {
    environment,
    discordToken,
    hotChannelId,
    generalChannelId,
    authRedirectUrl,
    adapters: loadAdapterConfig(environment),
  };
}

/**
 * Firebase設定を読み込み、必須項目を検証する
 */
export function loadFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.FIREBASE_API_KEY;
  const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
  const messageSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.FIREBASE_APP_ID;
  const measurementId = process.env.FIREBASE_MESUREMENT_ID;

  if (!apiKey) {
    throw new Error("Missing required environment variable: FIREBASE_API_KEY");
  }

  if (!authDomain) {
    throw new Error(
      "Missing required environment variable: FIREBASE_AUTH_DOMAIN",
    );
  }

  if (!projectId) {
    throw new Error(
      "Missing required environment variable: FIREBASE_PROJECT_ID",
    );
  }

  if (!storageBucket) {
    throw new Error(
      "Missing required environment variable: FIREBASE_STORAGE_BUCKET",
    );
  }

  if (!messagingSenderId) {
    throw new Error(
      "Missing required environment variable: FIREBASE_MESSAGING_SENDER_ID",
    );
  }

  if (!messageSenderId) {
    throw new Error(
      "Missing required environment variable: FIREBASE_MESSAGING_SENDER_ID",
    );
  }

  if (!appId) {
    throw new Error("Missing required environment variable: FIREBASE_APP_ID");
  }

  if (!measurementId) {
    throw new Error(
      "Missing required environment variable: FIREBASE_MESUREMENT_ID",
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    messageSenderId,
    appId,
    measurementId,
  };
}

/**
 * Firebase Admin SDK用のサービスアカウント情報を読み込む
 */
export function loadFirebaseServiceAccount(): FirebaseServiceAccount {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error(
      "Missing required environment variable: FIREBASE_SERVICE_ACCOUNT",
    );
  }

  try {
    return JSON.parse(serviceAccountJson) as FirebaseServiceAccount;
  } catch {
    throw new Error(
      "Invalid JSON in environment variable: FIREBASE_SERVICE_ACCOUNT",
    );
  }
}
