import { discordServerService } from "../services/discordServerService";
import { getHotChannels } from "./getHotChannels";

// TODO: Usecaseからdiscord.jsの依存を排除する
export async function postHotChannels(channelId: string): Promise<void> {
  const guildId = await discordServerService.getFirstGuild();
  const channelActivities = await getHotChannels(guildId);

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

  // Embedデータを構築
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
  const embed = {
    color: 0x0099ff,
    title: "Hot Channels Bot",
    description: `${now.toISOString().split("T")[0]} の発言数ランキング`,
    footer: { text: `合計発言数: ${totalMessages}` },
    fields,
  };

  await discordServerService.sendEmbedToChannel(channelId, embed);
}
