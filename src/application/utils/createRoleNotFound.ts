import type { Guild, Role as OriginalRole } from "discord.js";
import type Role from "../../domain/types/role";

interface CreateRoleNotFoundParams {
  guild: Guild;
  role: Role;
}

/**
 * ロールが存在しない場合は作成する
 * @param guild ギルド
 * @param role ロール
 * @returns ロール
 */
async function createRoleIfNotFound({
  guild,
  role,
}: CreateRoleNotFoundParams): Promise<OriginalRole> {
  const roles = await guild.roles.fetch();
  let originalRole: OriginalRole | undefined = roles.find(
    (r) => r.name === role.name,
  );
  if (!originalRole) {
    originalRole = await guild.roles.create({
      name: role.name,
      color: role.color,
      reason: role.reason,
    });
  }
  return originalRole;
}

export default createRoleIfNotFound;
