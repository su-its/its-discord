import { loadConfig } from "../config";
import type { ScheduledMessageCreate } from "../domain/entities/scheduledMessage";

/**
 * スケジュールメッセージの設定
 * 新しいスケジュールメッセージを追加する場合は、このファイルを編集してPRを作成してください
 */
const config = loadConfig();
export const SCHEDULED_MESSAGE_CONFIGS: Array<
  ScheduledMessageCreate & {
    id: string;
    description: string;
  }
> = [
  {
    id: "garbage-collection-reminder",
    description: "毎週月曜と木曜日のゴミ捨てリマインダー",
    channelId: config.generalChannelId,
    message: "🗑️ ゴミ捨ての時間です！忘れずにゴミを出しましょう",
    cronSchedule: "0 12 * * 1,4", // 毎週月曜日と木曜日の12時
  },
];
