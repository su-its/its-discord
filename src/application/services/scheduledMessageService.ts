import type {
  ScheduledMessage,
  ScheduledMessageCreate,
} from "../../domain/entities/scheduledMessage";
import type { ScheduledMessagePort } from "../ports/scheduledMessagePort";

/**
 * DIコンテナ - ScheduledMessagePortの実装を注入するためのシングルトン
 */
class ScheduledMessageServiceContainer {
  private _scheduledMessagePort: ScheduledMessagePort | null = null;

  setScheduledMessagePort(port: ScheduledMessagePort): void {
    this._scheduledMessagePort = port;
  }

  getScheduledMessagePort(): ScheduledMessagePort {
    if (!this._scheduledMessagePort) {
      throw new Error(
        "ScheduledMessagePort is not initialized. Call setScheduledMessagePort() first.",
      );
    }
    return this._scheduledMessagePort;
  }
}

// シングルトンインスタンス
export const scheduledMessageServiceContainer =
  new ScheduledMessageServiceContainer();

/**
 * Application層でScheduledMessagePortを使用するためのサービスクラス（簡素版）
 * ヘキサゴナルアーキテクチャに従い、Portのみに依存
 */
class ScheduledMessageService {
  async createScheduledMessage(
    message: ScheduledMessageCreate,
  ): Promise<ScheduledMessage> {
    return scheduledMessageServiceContainer
      .getScheduledMessagePort()
      .create(message);
  }

  async createScheduledMessageWithId(
    id: string,
    message: ScheduledMessageCreate,
  ): Promise<ScheduledMessage> {
    return scheduledMessageServiceContainer
      .getScheduledMessagePort()
      .createWithId(id, message);
  }

  async getAllActiveScheduledMessages(): Promise<ScheduledMessage[]> {
    return scheduledMessageServiceContainer
      .getScheduledMessagePort()
      .getAllActive();
  }

  async updateLastExecuted(id: string, timestamp: Date): Promise<void> {
    return scheduledMessageServiceContainer
      .getScheduledMessagePort()
      .updateLastExecuted(id, timestamp);
  }
}

// Application層で使用するサービスインスタンス
export const scheduledMessageService = new ScheduledMessageService();
