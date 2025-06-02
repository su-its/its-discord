/**
 * メール認証に関するデータ型
 */
export interface EmailAuthCredentials {
  email: string;
  password: string;
}

export interface EmailVerificationOptions {
  url: string;
  handleCodeInApp: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

/**
 * メール認証サービスを抽象化するPort（ヘキサゴナルアーキテクチャ）
 * Application層はこのインターフェースのみに依存し、Infrastructure層の詳細を知らない
 */
export interface EmailAuthPort {
  /**
   * メールアドレスとパスワードでユーザーを作成する
   */
  createUserWithEmailAndPassword(
    credentials: EmailAuthCredentials,
  ): Promise<AuthUser>;

  /**
   * 認証メールを送信する
   */
  sendEmailVerification(
    user: AuthUser,
    options: EmailVerificationOptions,
  ): Promise<void>;

  /**
   * メールアドレスでユーザーを取得する
   */
  getUserByEmail(email: string): Promise<AuthUser | null>;

  /**
   * ユーザーのメール認証状況を確認する
   */
  isEmailVerified(email: string): Promise<boolean>;
}
