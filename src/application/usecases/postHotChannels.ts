import { discordServerService } from "../services/discordServerService";
import { generateChannelActivityRanking } from "./getHotChannels";

// TODO: Usecaseからdiscord.jsの依存を排除する
export async function postHotChannels(channelId: string): Promise<void> {
  const guild = await discordServerService.getFirstGuild();
  const ranking = await generateChannelActivityRanking(guild.id);
  await discordServerService.sendEmbedToChannel(guild.id, channelId, ranking);
}
