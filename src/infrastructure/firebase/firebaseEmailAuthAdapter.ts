import * as admin from "firebase-admin";
import { type FirebaseApp, initializeApp } from "firebase/app";
import {
  type Auth,
  type UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
} from "firebase/auth";
import serviceAccount from "../../../its-discord-auth-firebase-adminsdk-wn2uo-ac781d8325.json";
import type {
  AuthUser,
  EmailAuthCredentials,
  EmailAuthPort,
  EmailVerificationOptions,
} from "../../application/ports/emailAuthPort";
import { loadFirebaseConfig } from "../../config/environment";
import logger from "../logger";

/**
 * FirebaseによるEmailAuthPortの実装
 */
export class FirebaseEmailAuthAdapter implements EmailAuthPort {
  private readonly auth: Auth;
  private readonly adminAuth: admin.auth.Auth;

  constructor() {
    // Firebase Admin初期化
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }
    this.adminAuth = admin.auth();

    // Firebase Client初期化
    const firebaseConfig = loadFirebaseConfig();
    const app: FirebaseApp = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  async createUserWithEmailAndPassword(
    credentials: EmailAuthCredentials,
  ): Promise<AuthUser> {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          credentials.email,
          credentials.password,
        );

      if (!userCredential.user) {
        throw new Error("User object is null after creation");
      }

      // ユーザー作成後、即座に認証メールを送信する準備ができている状態
      const authUser: AuthUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
      };

      return authUser;
    } catch (error) {
      logger.error(
        `Failed to create user with email ${credentials.email}:`,
        error,
      );
      throw error;
    }
  }

  async sendEmailVerification(
    user: AuthUser,
    options: EmailVerificationOptions,
  ): Promise<void> {
    try {
      // 現在の認証されたユーザーが存在する場合にメールを送信
      const currentUser = this.auth.currentUser;
      if (!currentUser || currentUser.uid !== user.uid) {
        throw new Error("User is not currently authenticated or user mismatch");
      }

      await sendEmailVerification(currentUser, {
        url: options.url,
        handleCodeInApp: options.handleCodeInApp,
      });

      logger.info(`Email verification sent to ${user.email}`);
    } catch (error) {
      logger.error(
        `Failed to send verification email to ${user.email}:`,
        error,
      );
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const userRecord = await this.adminAuth.getUserByEmail(email);
      return {
        uid: userRecord.uid,
        email: userRecord.email || null,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as Error & { code: string }).code === "auth/user-not-found"
      ) {
        return null;
      }
      logger.error(`Failed to get user by email ${email}:`, error);
      throw error;
    }
  }

  async isEmailVerified(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      return user?.emailVerified ?? false;
    } catch (error) {
      logger.error(`Failed to check email verification for ${email}:`, error);
      return false;
    }
  }
}
