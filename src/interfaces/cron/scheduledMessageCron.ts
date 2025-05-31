import { CronJob } from "cron";
import { sendScheduledMessage } from "../../application/usecases/sendScheduledMessage";
import logger from "../../infrastructure/logger";

/**
 * アクティブなスケジュールメッセージのCronジョブを管理するクラス
 */
class ScheduledMessageCronManager {
  private jobs: Map<string, CronJob> = new Map();

  /**
   * 特定のスケジュールメッセージのCronジョブを作成する
   * @param messageId メッセージID
   * @param cronSchedule Cron式
   */
  createJobForMessage(messageId: string, cronSchedule: string): void {
    try {
      // 既存のジョブがあれば停止
      this.stopJob(messageId);

      const job = new CronJob(
        cronSchedule,
        async () => {
          try {
            await sendScheduledMessage(messageId);
          } catch (error) {
            logger.error(`Error executing scheduled message ${messageId}:`, error);
          }
        },
        null, // onComplete
        false, // start immediately
        "Asia/Tokyo" // timezone
      );

      this.jobs.set(messageId, job);
      job.start();

      logger.info(`Created cron job for scheduled message: ${messageId} with schedule: ${cronSchedule}`);
    } catch (error) {
      logger.error(`Failed to create cron job for message ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * 特定のスケジュールメッセージのCronジョブを停止する
   * @param messageId メッセージID
   */
  stopJob(messageId: string): void {
    const job = this.jobs.get(messageId);
    if (job) {
      job.stop();
      this.jobs.delete(messageId);
      logger.info(`Stopped cron job for scheduled message: ${messageId}`);
    }
  }

  /**
   * すべてのCronジョブを停止する
   */
  stopAllJobs(): void {
    for (const [messageId, job] of this.jobs) {
      job.stop();
      logger.debug(`Stopped cron job for scheduled message: ${messageId}`);
    }
    this.jobs.clear();
    logger.info("All scheduled message cron jobs stopped");
  }

  /**
   * 現在実行中のジョブ数を取得する
   */
  getActiveJobCount(): number {
    return this.jobs.size;
  }

  /**
   * 特定のメッセージのジョブが実行中かチェックする
   * @param messageId メッセージID
   */
  isJobActive(messageId: string): boolean {
    return this.jobs.has(messageId);
  }
}

// シングルトンインスタンス
export const scheduledMessageCronManager = new ScheduledMessageCronManager();

/**
 * スケジュールメッセージのCronシステムを初期化する
 * アプリケーション起動時に呼び出される
 */
export async function initializeScheduledMessageCron(): Promise<void> {
  try {
    logger.info("Scheduled message cron system initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize scheduled message cron system:", error);
    throw error;
  }
}

/**
 * 新しいスケジュールメッセージのCronジョブを追加する
 * @param messageId メッセージID
 * @param cronSchedule Cron式
 */
export function addScheduledMessageJob(messageId: string, cronSchedule: string): void {
  scheduledMessageCronManager.createJobForMessage(messageId, cronSchedule);
}

/**
 * スケジュールメッセージのCronジョブを削除する
 * @param messageId メッセージID
 */
export function removeScheduledMessageJob(messageId: string): void {
  scheduledMessageCronManager.stopJob(messageId);
}
