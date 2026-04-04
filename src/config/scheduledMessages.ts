import type { AppDeps } from "../application/ports/deps";
import { createHotChannelsEmbed } from "../application/usecases/createHotChannelsEmbed";
import { getHotChannels } from "../application/usecases/getHotChannels";
import type { ScheduledMessageCreate } from "../domain/entities/scheduledMessage";
import { loadConfig } from "./environment";

/**
 * スケジュールメッセージの設定を生成する
 * deps をクロージャでキャプチャし、messageContent 関数内で使用する
 */
export function createScheduledMessageConfigs(deps: AppDeps): Array<
  ScheduledMessageCreate & {
    id: string;
    description: string;
  }
> {
  const config = loadConfig();

  return [
    {
      id: "hot-channels-daily",
      description: "毎日のホットチャンネル投稿",
      channelId: config.hotChannelId,
      messageContent: async () => {
        const channelActivities = await getHotChannels(config.guildId, deps);
        return createHotChannelsEmbed(config.guildId, channelActivities);
      },
      cronSchedule: "0 0 * * *",
    },
    {
      id: "garbage-collection-reminder",
      description: "毎週月曜と木曜日のゴミ捨てリマインダー",
      channelId: config.generalChannelId,
      messageContent: "🗑️ ゴミ捨ての時間です！忘れずにゴミを出しましょう",
      cronSchedule: "0 12 * * 1,4",
    },
    {
      id: "monthly-report-closing-reminder",
      description: "月次報告のリマインダー",
      channelId: config.generalChannelId,
      messageContent: "月末が近いです。月次報告は出しましたか？",
      cronSchedule: "0 12 28 * *",
    },
    {
      id: "monthly-report-reminder",
      description: "月次報告のリマインダー",
      channelId: config.generalChannelId,
      messageContent: "新しい月になりました。月次報告は提出済みですか？",
      cronSchedule: "0 12 1 * *",
    },
  ];
}
