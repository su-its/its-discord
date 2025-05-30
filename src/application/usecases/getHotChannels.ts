import type { EmbedData } from "../ports/discordServerPort";
import { discordServerService } from "../services/discordServerService";

// TODO: Usecaseからdiscord.jsの依存を排除する
export async function generateChannelActivityRanking(
  guildId: string,
): Promise<EmbedData> {
  return await discordServerService.generateChannelActivityRanking(guildId);
}
