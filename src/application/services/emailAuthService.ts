import type { EmailAuthPort } from "../ports/emailAuthPort";

/**
 * DIコンテナ - EmailAuthPortの実装を注入するためのシングルトン
 */
class EmailAuthServiceContainer {
  private _emailAuthPort: EmailAuthPort | null = null;

  /**
   * EmailAuthPortの実装を注入する
   */
  setEmailAuthPort(port: EmailAuthPort): void {
    this._emailAuthPort = port;
  }

  /**
   * EmailAuthPortの実装を取得する
   */
  getEmailAuthPort(): EmailAuthPort {
    if (!this._emailAuthPort) {
      throw new Error(
        "EmailAuthPort is not initialized. Call setEmailAuthPort() first.",
      );
    }
    return this._emailAuthPort;
  }
}

// シングルトンインスタンス
export const emailAuthServiceContainer = new EmailAuthServiceContainer();

/**
 * Application層でEmailAuthPortを使用するためのサービスクラス
 * ヘキサゴナルアーキテクチャに従い、Portのみに依存
 */
export class EmailAuthService {
  private get port(): EmailAuthPort {
    return emailAuthServiceContainer.getEmailAuthPort();
  }

  async createUserWithEmailAndPassword(
    credentials: Parameters<EmailAuthPort["createUserWithEmailAndPassword"]>[0],
  ): Promise<ReturnType<EmailAuthPort["createUserWithEmailAndPassword"]>> {
    return this.port.createUserWithEmailAndPassword(credentials);
  }

  async sendEmailVerification(
    user: Parameters<EmailAuthPort["sendEmailVerification"]>[0],
    options: Parameters<EmailAuthPort["sendEmailVerification"]>[1],
  ): Promise<void> {
    return this.port.sendEmailVerification(user, options);
  }

  async getUserByEmail(
    email: string,
  ): Promise<ReturnType<EmailAuthPort["getUserByEmail"]>> {
    return this.port.getUserByEmail(email);
  }

  async isEmailVerified(
    email: string,
  ): Promise<ReturnType<EmailAuthPort["isEmailVerified"]>> {
    return this.port.isEmailVerified(email);
  }
}

// Application層で使用するサービスインスタンス
export const emailAuthService = new EmailAuthService();
