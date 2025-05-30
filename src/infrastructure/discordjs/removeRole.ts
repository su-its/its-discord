import type { Guild, GuildMember } from "discord.js";
import { discordServerService } from "../../application/services/discordServerService";
import type Role from "../../domain/types/role";

/**
 * メンバーからロールを削除する
 * @param guild ギルド
 * @param member メンバー
 * @param role ロール
 */
async function removeRole(guild: Guild, member: GuildMember, role: Role) {
  await discordServerService.removeRoleFromMember(guild.id, member.id, role);
}

export default removeRole;
