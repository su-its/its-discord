import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";
import { scheduledMessageService } from "../services/scheduledMessageService";

/**
 * スケジュールされたメッセージを送信するユースケース
 * @param scheduledMessageId 送信するスケジュールメッセージのID
 */
export async function sendScheduledMessage(
  scheduledMessageId: string,
): Promise<void> {
  try {
    // アクティブなスケジュールメッセージを取得
    const activeMessages =
      await scheduledMessageService.getAllActiveScheduledMessages();
    const targetMessage = activeMessages.find(
      (msg) => msg.id === scheduledMessageId,
    );

    if (!targetMessage) {
      logger.warn(
        `Scheduled message with ID ${scheduledMessageId} not found or inactive`,
      );
      return;
    }

    // メッセージを送信
    await discordServerService.sendMessageToChannel(
      targetMessage.channelId,
      targetMessage.message,
    );

    // 最後の実行時刻を更新
    await scheduledMessageService.updateLastExecuted(
      scheduledMessageId,
      new Date(),
    );

    logger.info(`Scheduled message sent successfully: ${scheduledMessageId}`);
  } catch (error) {
    logger.error(
      `Failed to send scheduled message ${scheduledMessageId}:`,
      error,
    );
    throw error;
  }
}

/**
 * すべてのアクティブなスケジュールメッセージを実行するユースケース
 * 主にCronジョブから呼び出される
 */
export async function executeAllScheduledMessages(): Promise<void> {
  try {
    const activeMessages =
      await scheduledMessageService.getAllActiveScheduledMessages();

    if (activeMessages.length === 0) {
      logger.debug("No active scheduled messages to execute");
      return;
    }

    logger.info(`Executing ${activeMessages.length} scheduled messages`);

    // 並列実行でパフォーマンスを向上
    const promises = activeMessages.map(async (message) => {
      try {
        await discordServerService.sendMessageToChannel(
          message.channelId,
          message.message,
        );
        await scheduledMessageService.updateLastExecuted(
          message.id,
          new Date(),
        );
        logger.debug(`Scheduled message executed: ${message.id}`);
      } catch (error) {
        logger.error(
          `Failed to execute scheduled message ${message.id}:`,
          error,
        );
      }
    });

    await Promise.allSettled(promises);
    logger.info("All scheduled messages execution completed");
  } catch (error) {
    logger.error("Failed to execute scheduled messages:", error);
    throw error;
  }
}
