import type { Guild, GuildMember, Role as OriginalRole } from "discord.js";
import createRoleIfNotFound from "../../application/utils/createRoleNotFound";
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
  const originalRole: OriginalRole = await createRoleIfNotFound({
    guild,
    role,
  });
  await member.roles.add(originalRole);
}

export default addRole;
