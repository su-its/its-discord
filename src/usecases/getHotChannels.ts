import {
  type APIEmbedField,
  ChannelType,
  EmbedBuilder,
  type Guild,
  SnowflakeUtil,
  type TextChannel,
} from "discord.js";

export async function generateChannelActivityRanking(guild: Guild) {
  const now = new Date();
  const oneDayAgoSnowflake = SnowflakeUtil.generate({
    timestamp: now.getTime() - 24 * 60 * 60 * 1000,
  });

  const channels = await guild.channels.fetch();
  const textChannels = channels.filter(
    (channel): channel is TextChannel =>
      channel !== null && channel.type === ChannelType.GuildText,
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
          const lastMessage = messages.last();
          if (lastMessage && lastMessage.createdTimestamp < oneDayAgoSnowflake)
            break;
        }
        return {
          id: channel.id,
          name: channel.name,
          count: totalMessages,
        };
      } catch (error) {
        console.error(
          `Error fetching messages for channel ${channel.name}:`,
          error,
        );
        return {
          id: channel.id,
          name: channel.name,
          count: 0,
        };
      }
    }),
  );

  const targetChannels = channelStats.filter((channel) => channel.count > 0);
  const sortedStats = targetChannels
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  const totalMessages = sortedStats.reduce(
    (sum, channel) => sum + channel.count,
    0,
  );

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Hot Channels Bot")
    .setDescription(`${now.toISOString().split("T")[0]} の発言数ランキング`)
    .setFooter({ text: `合計発言数: ${totalMessages}` });

  const fields: APIEmbedField | APIEmbedField[] = [];
  sortedStats.forEach((channel, index) => {
    const percentage = ((channel.count / totalMessages) * 100).toFixed(1);
    fields.push({
      name: `${index + 1}. https://discord.com/channels/${guild.id}/${channel.id}`,
      value: `発言数: ${channel.count} (${percentage}%)`,
      inline: false,
    });
  });

  embed.addFields(fields);

  return embed;
}
