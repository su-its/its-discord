import { v4 as uuidv4 } from "uuid";
import type { ScheduledMessagePort } from "../../application/ports/scheduledMessagePort";
import type {
  ScheduledMessage,
  ScheduledMessageCreate,
} from "../../domain/entities/scheduledMessage";
import logger from "../logger";

/**
 * メモリベースのスケジュールメッセージリポジトリ（簡素版）
 * 本格的な実装では、データベース（Firebase、PostgreSQL等）を使用することを推奨
 */
class MemoryScheduledMessageRepository implements ScheduledMessagePort {
  private messages: Map<string, ScheduledMessage> = new Map();

  async create(messageData: ScheduledMessageCreate): Promise<ScheduledMessage> {
    const id = uuidv4();
    const now = new Date();

    const scheduledMessage: ScheduledMessage = {
      id,
      channelId: messageData.channelId,
      messageContent: messageData.messageContent,
      cronSchedule: messageData.cronSchedule,
      isActive: true,
      createdAt: now,
    };

    this.messages.set(id, scheduledMessage);
    logger.debug(`Created scheduled message in memory: ${id}`);

    return scheduledMessage;
  }

  /**
   * IDを指定してスケジュールメッセージを作成する
   * 設定ファイルからの初期化で使用
   */
  async createWithId(
    id: string,
    messageData: ScheduledMessageCreate,
  ): Promise<ScheduledMessage> {
    if (this.messages.has(id)) {
      throw new Error(`Scheduled message with ID ${id} already exists`);
    }

    const now = new Date();

    const scheduledMessage: ScheduledMessage = {
      id,
      channelId: messageData.channelId,
      messageContent: messageData.messageContent,
      cronSchedule: messageData.cronSchedule,
      isActive: true,
      createdAt: now,
    };

    this.messages.set(id, scheduledMessage);
    logger.debug(
      `Created scheduled message with specified ID in memory: ${id}`,
    );

    return scheduledMessage;
  }

  async getAllActive(): Promise<ScheduledMessage[]> {
    const activeMessages = Array.from(this.messages.values()).filter(
      (message) => message.isActive,
    );

    logger.debug(
      `Retrieved ${activeMessages.length} active scheduled messages from memory`,
    );
    return activeMessages;
  }

  async updateLastExecuted(id: string, timestamp: Date): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new Error(`Scheduled message not found: ${id}`);
    }

    message.lastExecutedAt = timestamp;
    this.messages.set(id, message);
    logger.debug(`Updated last executed time for scheduled message: ${id}`);
  }
}

// シングルトンインスタンス
export const memoryScheduledMessageRepository =
  new MemoryScheduledMessageRepository();
