import { discordServerService } from "../application/services/discordServerService";
import { createHotChannelsEmbed } from "../application/usecases/createHotChannelsEmbed";
import { getHotChannels } from "../application/usecases/getHotChannels";
import { loadConfig } from "../config";
import type { ScheduledMessageCreate } from "../domain/entities/scheduledMessage";

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
      const guildId = await discordServerService.getFirstGuild();
      const channelActivities = await getHotChannels(guildId);
      return createHotChannelsEmbed(guildId, channelActivities);
    },
    cronSchedule: "0 0 * * *",
  },
  {
    id: "garbage-collection-reminder",
    description: "毎週月曜と木曜日のゴミ捨てリマインダー",
    channelId: config.generalChannelId || "",
    messageContent: "🗑️ ゴミ捨ての時間です！忘れずにゴミを出しましょう",
    cronSchedule: "0 12 * * 1,4", // 毎週月曜日と木曜日の12時
  },
];
