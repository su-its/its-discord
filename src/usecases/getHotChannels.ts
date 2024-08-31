import { ChannelType, Guild, TextChannel, SnowflakeUtil } from "discord.js";

export async function getHotChannels(guild: Guild): Promise<string> {
  const channels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText) as Map<
    string,
    TextChannel
  >;

  const now = new Date();
  const oneWeekAgoSnowflake = SnowflakeUtil.generate({ timestamp: now.getTime() - 7 * 24 * 60 * 60 * 1000 });

  const channelStats = await Promise.all(
    Array.from(channels.values()).map(async (channel) => {
      const messages = await channel.messages.fetch({ after: oneWeekAgoSnowflake.toString() });
      return {
        name: channel.name,
        count: messages.size,
      };
    })
  );

  const sortedStats = channelStats.sort((a, b) => b.count - a.count).slice(0, 20);

  const totalMessages = sortedStats.reduce((sum, channel) => sum + channel.count, 0);

  let ranking = `Hot Channels Bot\n${now.toISOString().split("T")[0]} の発言数ランキング\n合計発言数: ${totalMessages}\n`;

  sortedStats.forEach((channel, index) => {
    const percentage = ((channel.count / totalMessages) * 100).toFixed(1);
    ranking += `${index + 1}. #${channel.name} / 発言数: ${channel.count} (${percentage}%)\n`;
  });

  return ranking;
}
