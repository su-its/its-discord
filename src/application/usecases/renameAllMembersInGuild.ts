import logger from "../../infrastructure/logger";
import type { MemberRenameResult } from "../ports/discordServerPort";
import { discordServerService } from "../services/discordServerService";
import { itsCoreService } from "../services/itsCoreService";

export async function renameAllMembersInGuild(
  guildId: string,
): Promise<MemberRenameResult> {
  // ITSCoreから全メンバーのDiscordIDと名前のマッピングを取得
  const members = await itsCoreService.getMemberList();
  const memberNameMap = new Map<string, string>();

  for (const member of members) {
    if (member.discordId) {
      memberNameMap.set(member.discordId, member.name);
    }
  }

  // DiscordServerServiceを使って一括リネーム
  return await discordServerService.renameAllMembersInGuild(
    guildId,
    memberNameMap,
  );
}
