import { ChannelType, Guild, TextChannel, SnowflakeUtil } from "discord.js";

export async function getHotChannels(guild: Guild): Promise<string> {
  const now = new Date();
  const oneDayAgoSnowflake = SnowflakeUtil.generate({ timestamp: now.getTime() - 24 * 60 * 60 * 1000 });

  const channels = await guild.channels.fetch();
  const textChannels = channels.filter(
    (channel): channel is TextChannel => channel !== null && channel.type === ChannelType.GuildText
  );

  const channelStats = await Promise.all(
    textChannels.map(async (channel) => {
      try {
        let totalMessages = 0;
        let lastId: string | undefined;

        while (true) {
          const messages = await channel.messages.fetch({
            limit: 100,
            after: lastId || oneDayAgoSnowflake.toString(),
          });

          if (messages.size === 0) break;

          totalMessages += messages.size;
          lastId = messages.last()?.id;

          if (messages.last()!.createdTimestamp < oneDayAgoSnowflake) break;
        }

        return {
          id: channel.id,
          name: channel.name,
          count: totalMessages,
        };
      } catch (error) {
        console.error(`Error fetching messages for channel ${channel.name}:`, error);
        return {
          name: channel.name,
          count: 0,
        };
      }
    })
  );

  const targetChannels = channelStats.filter((channel) => channel.count > 0);
  const sortedStats = targetChannels.sort((a, b) => b.count - a.count).slice(0, 20);
  const totalMessages = sortedStats.reduce((sum, channel) => sum + channel.count, 0);

  let ranking = `Hot Channels Bot\n${now.toISOString().split("T")[0]} の発言数ランキング\n合計発言数: ${totalMessages}\n`;

  sortedStats.forEach((channel, index) => {
    const percentage = ((channel.count / totalMessages) * 100).toFixed(1);
    ranking += `${index + 1}. https://discord.com/channels/${guild.id}/${channel.id} / 発言数: ${channel.count} (${percentage}%)\n`;
  });

  return ranking;
}
