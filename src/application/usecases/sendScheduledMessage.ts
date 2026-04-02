import type { Embed } from "../../domain/entities/scheduledMessage";
import logger from "../../infrastructure/logger";
import type { AppDeps } from "../ports/deps";

/**
 * スケジュールされたメッセージを送信するユースケース
 * @param scheduledMessageId 送信するスケジュールメッセージのID
 */
export async function sendScheduledMessage(
  scheduledMessageId: string,
  deps: Pick<
    AppDeps,
    "discordChannelPort" | "discordMessagePort" | "scheduledMessagePort"
  >,
): Promise<void> {
  try {
    // アクティブなスケジュールメッセージを取得
    const activeMessages = await deps.scheduledMessagePort.getAllActive();
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
      await deps.discordMessagePort.sendMessageToChannel(
        targetMessage.channelId,
        targetMessage.messageContent,
      );
      logger.debug(`Sent static message to channel ${targetMessage.channelId}`);
    } else {
      const content = await targetMessage.messageContent();
      if (typeof content === "object" && content.title) {
        await deps.discordChannelPort.sendEmbedToChannel(
          targetMessage.channelId,
          content as Embed,
        );
      } else {
        await deps.discordMessagePort.sendMessageToChannel(
          targetMessage.channelId,
          content as string,
        );
      }
      logger.debug(
        `Executed message function for channel ${targetMessage.channelId}`,
      );
    }

    // 最後の実行時刻を更新
    await deps.scheduledMessagePort.updateLastExecuted(
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
