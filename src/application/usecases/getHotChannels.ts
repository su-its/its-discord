import type { EmbedData } from "../ports/discordServerPort";
import { discordServerService } from "../services/discordServerService";

/**
 * チャンネル活動ランキングを生成するUsecase
 * 各チャンネルの過去24時間の活動データを集計してEmbedデータを作成
 */
export async function generateChannelActivityRanking(
  guildId: string,
): Promise<EmbedData> {
  // 1. ギルドの全テキストチャンネルを取得
  const channels = await discordServerService.getTextChannels(guildId);

  // 2. 各チャンネルのメッセージ数を並列取得
  const channelStats = await Promise.all(
    channels.map(async (channel) => ({
      id: channel.id,
      name: channel.name,
      count: await discordServerService.getChannelMessageCount(
        guildId,
        channel.id,
      ),
    })),
  );

  // 3. アクティブなチャンネルのみフィルタリング・ソート
  const activeChannels = channelStats.filter((channel) => channel.count > 0);
  const sortedStats = activeChannels
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // 上位20チャンネル

  // 4. 合計メッセージ数を計算
  const totalMessages = sortedStats.reduce(
    (sum, channel) => sum + channel.count,
    0,
  );

  // 5. Embedデータを構築
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
