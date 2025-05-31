import { discordServerService } from "../services/discordServerService";

export interface ChannelActivity {
  id: string;
  name: string;
  count: number;
}

export async function getHotChannels(
  guildId: string,
): Promise<ChannelActivity[]> {
  const channels = await discordServerService.getTextChannels(guildId);

  const channelActivities = await Promise.all(
    channels.map(async (channel) => ({
      id: channel.id,
      name: channel.name,
      count: await discordServerService.getChannelMessageCount(channel.id),
    })),
  );

  return channelActivities.sort((a, b) => b.count - a.count);
}
