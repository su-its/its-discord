import type { TextChannel } from "discord.js";
import type { CustomClient } from "../../domain/types/customClient";
import { generateChannelActivityRanking } from "./getHotChannels";

export async function postHotChannels(client: CustomClient, channelId: string): Promise<void> {
  const guild = client.guilds.cache.first();
  if (!guild) {
    throw new Error("Guild not found");
  }
  const ranking = await generateChannelActivityRanking(guild);
  const channel = guild.channels.cache.find((ch) => ch.id === channelId) as TextChannel;
  if (channel) {
    await channel.send({ embeds: [ranking] });
  } else {
    throw new Error("Channel not found");
  }
}
