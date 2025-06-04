import type { Embed } from "../../domain/entities/scheduledMessage";
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

    // メッセージコンテンツを実行
    if (typeof targetMessage.messageContent === "string") {
      // 静的テキストメッセージの場合
      await discordServerService.sendMessageToChannel(
        targetMessage.channelId,
        targetMessage.messageContent,
      );
      logger.debug(`Sent static message to channel ${targetMessage.channelId}`);
    } else {
      // 関数の場合は実行（既存のUsecaseはvoidを返すので、戻り値の処理は不要）
      const constnt = await targetMessage.messageContent();
      if (typeof constnt === "object" && constnt.title) {
        await discordServerService.sendEmbedToChannel(
          targetMessage.channelId,
          constnt as Embed,
        );
      } else {
        await discordServerService.sendMessageToChannel(
          targetMessage.channelId,
          constnt as string,
        );
      }
      logger.debug(
        `Executed message function for channel ${targetMessage.channelId}`,
      );
    }

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
async function executeAllScheduledMessages(): Promise<void> {
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
        if (typeof message.messageContent === "string") {
          // 静的テキストメッセージの場合
          await discordServerService.sendMessageToChannel(
            message.channelId,
            message.messageContent,
          );
        } else {
          // 関数の場合は実行
          const content = await message.messageContent();
          if (typeof content === "object" && content.title) {
            await discordServerService.sendEmbedToChannel(
              message.channelId,
              content as Embed,
            );
          } else {
            await discordServerService.sendMessageToChannel(
              message.channelId,
              content as string,
            );
          }
        }
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
