import type { Embed } from "../../domain/entities/scheduledMessage";
import type { ChannelActivity } from "./getHotChannels";

/**
 * Hot Channelsのembedデータを生成するユースケース
 */
export async function createHotChannelsEmbed(
  guildId: string,
  channelActivities: ChannelActivity[],
): Promise<Embed> {
  // アクティブなチャンネルのみフィルタリング・ソート
  const activeChannels = channelActivities.filter(
    (channel) => channel.count > 0,
  );
  const sortedStats = activeChannels.slice(0, 20); // 上位20チャンネル

  // 合計メッセージ数を計算
  const totalMessages = sortedStats.reduce(
    (sum, channel) => sum + channel.count,
    0,
  );

  // Embedのフィールドを構築
  const fields = sortedStats.map((channel, index) => {
    const percentage =
      totalMessages > 0
        ? ((channel.count / totalMessages) * 100).toFixed(1)
        : "0.0";
    return {
      name: `${index + 1}. https://discord.com/channels/${guildId}/${channel.id}`,
      value: `発言数: ${channel.count} (${percentage}%)`,
      inline: false,
    };
  });

  const now = new Date();

  return {
    color: 0x0099ff,
    title: "Hot Channels Bot",
    description: `${now.toISOString().split("T")[0]} の発言数ランキング`,
    footer: { text: `合計発言数: ${totalMessages}` },
    fields,
  };
}
