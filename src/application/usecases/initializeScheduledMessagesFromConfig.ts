import { SCHEDULED_MESSAGE_CONFIGS } from "../../config/scheduledMessages";
import logger from "../../infrastructure/logger";
import { addScheduledMessageJob } from "../../interfaces/cron/scheduledMessageCron";
import { scheduledMessageService } from "../services/scheduledMessageService";

/**
 * 設定ファイルからスケジュールメッセージを初期化するユースケース
 * アプリケーション起動時に呼び出される
 */
export async function initializeScheduledMessagesFromConfig(): Promise<void> {
  try {
    logger.info("Initializing scheduled messages from configuration...");

    // 既存のアクティブなメッセージを取得
    const existingMessages =
      await scheduledMessageService.getAllActiveScheduledMessages();
    const existingIds = new Set(existingMessages.map((msg) => msg.id));

    logger.info(
      `Found ${existingMessages.length} existing active scheduled messages`,
    );

    let createdCount = 0;
    let skippedCount = 0;

    // 設定からスケジュールメッセージを作成
    for (const config of SCHEDULED_MESSAGE_CONFIGS) {
      // チャンネルIDが空の場合はスキップ
      if (!config.channelId) {
        logger.warn(
          `Skipping scheduled message '${config.id}': channelId is empty`,
        );
        skippedCount++;
        continue;
      }

      // 既に存在する場合はスキップ
      if (existingIds.has(config.id)) {
        logger.debug(
          `Scheduled message '${config.id}' already exists, skipping creation`,
        );
        skippedCount++;
        continue;
      }

      try {
        // IDを指定してスケジュールメッセージを作成
        const scheduledMessage =
          await scheduledMessageService.createScheduledMessageWithId(
            config.id,
            {
              channelId: config.channelId,
              messageContent: config.messageContent,
              cronSchedule: config.cronSchedule,
            },
          );

        // Cronジョブを追加
        addScheduledMessageJob(
          scheduledMessage.id,
          scheduledMessage.cronSchedule,
        );

        logger.info(
          `Created scheduled message: ${config.id} (${config.description})`,
        );
        createdCount++;
      } catch (error) {
        logger.error(
          `Failed to create scheduled message '${config.id}':`,
          error,
        );
        // 個別のエラーは続行可能とする
      }
    }

    logger.info(
      `Scheduled messages initialization completed: ${createdCount} created, ${skippedCount} skipped`,
    );
  } catch (error) {
    logger.error(
      "Failed to initialize scheduled messages from configuration:",
      error,
    );
    throw error;
  }
}
