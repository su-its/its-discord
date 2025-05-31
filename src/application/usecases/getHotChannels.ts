import type { EmbedData } from "../ports/discordServerPort";
import { discordServerService } from "../services/discordServerService";

export async function generateChannelActivityRanking(
  guildId: string,
): Promise<EmbedData> {
  return await discordServerService.generateChannelActivityEmbedData(guildId);
}
