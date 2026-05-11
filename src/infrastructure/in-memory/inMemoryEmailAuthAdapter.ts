import type {
  AuthUser,
  EmailAuthCredentials,
  EmailAuthPort,
  EmailVerificationOptions,
} from "../../application/ports/emailAuthPort";
import logger from "../logger";

/**
 * EmailAuthPort の in-memory 実装（ローカル検証用）
 * Firebase に接続せず、メール認証状態を Map で管理する。
 * メール認証は自動的に完了済みとして扱う。
 */
export class InMemoryEmailAuthAdapter implements EmailAuthPort {
  private users = new Map<string, AuthUser>();
  private nextUid = 1;

  async createUserWithEmailAndPassword(
    credentials: EmailAuthCredentials,
  ): Promise<AuthUser> {
    const uid = `uid_${this.nextUid++}`;
    const user: AuthUser = {
      uid,
      email: credentials.email,
      emailVerified: true,
    };
    this.users.set(credentials.email, user);
    logger.info(
      `[InMemory] Created auth user: ${credentials.email} (emailVerified: true)`,
    );
    return user;
  }

  async sendEmailVerification(
    user: AuthUser,
    _options: EmailVerificationOptions,
  ): Promise<void> {
    logger.info(`[InMemory] Email verification skipped for: ${user.email}`);
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    return this.users.get(email) ?? null;
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const user = this.users.get(email);
    return user?.emailVerified ?? false;
  }
}
