import type { Guild, GuildMember } from "discord.js";
import { discordServerService } from "../../application/services/discordServerService";
import type Role from "../../domain/types/role";

/**
 * メンバーにロールを追加する
 * ロールが存在しない場合は作成する
 * @param guild ギルド
 * @param member メンバー
 * @param role ロール
 */
async function addRole(guild: Guild, member: GuildMember, role: Role) {
  // TODO: ロールが存在しない場合かってに作ってしまっている https://github.com/su-its/its-discord/issues/84
  await discordServerService.addRoleToMember(guild.id, member.id, role);
}

export default addRole;
