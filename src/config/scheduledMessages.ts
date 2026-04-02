import { createHotChannelsEmbed } from "../application/usecases/createHotChannelsEmbed";
import { getHotChannels } from "../application/usecases/getHotChannels";
import type { ScheduledMessageCreate } from "../domain/entities/scheduledMessage";
import { loadConfig } from "./environment";

/**
 * スケジュールメッセージの設定
 * 新しいスケジュールメッセージを追加する場合は、この配列に追加してPRを作成してください
 */
const config = loadConfig();
export const SCHEDULED_MESSAGE_CONFIGS: Array<
  ScheduledMessageCreate & {
    id: string;
    description: string;
  }
> = [
  {
    id: "hot-channels-daily",
    description: "毎日のホットチャンネル投稿",
    channelId: config.hotChannelId,
    messageContent: async () => {
      const channelActivities = await getHotChannels(config.guildId);
      return createHotChannelsEmbed(config.guildId, channelActivities);
    },
    // 深夜0時
    cronSchedule: "0 0 * * *",
  },
  {
    id: "garbage-collection-reminder",
    description: "毎週月曜と木曜日のゴミ捨てリマインダー",
    channelId: config.generalChannelId,
    messageContent: "🗑️ ゴミ捨ての時間です！忘れずにゴミを出しましょう",
    cronSchedule: "0 12 * * 1,4", // 毎週月曜日と木曜日の12時
  },
  {
    id: "monthly-report-closing-reminder",
    description: "月次報告のリマインダー",
    channelId: config.generalChannelId,
    messageContent: "月末が近いです。月次報告は出しましたか？",
    cronSchedule: "0 12 28 * *", // 毎月28日
  },
  {
    id: "monthly-report-reminder",
    description: "月次報告のリマインダー",
    channelId: config.generalChannelId,
    messageContent: "新しい月になりました。月次報告は提出済みですか？",
    cronSchedule: "0 12 1 * *", // 毎月1日
  },
];
