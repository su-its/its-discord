import type { AppDeps } from "../ports/deps";

export interface ChannelActivity {
  id: string;
  name: string;
  count: number;
}

export async function getHotChannels(
  guildId: string,
  deps: Pick<AppDeps, "discordChannelPort">,
): Promise<ChannelActivity[]> {
  const channels = await deps.discordChannelPort.getTextChannels(guildId);

  const channelActivities = await Promise.all(
    channels.map(async (channel) => ({
      id: channel.id,
      name: channel.name,
      count: await deps.discordChannelPort.getChannelMessageCount(channel.id),
    })),
  );

  return channelActivities.sort((a, b) => b.count - a.count);
}
