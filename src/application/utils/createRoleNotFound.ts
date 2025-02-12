import type { Guild, Role as OriginalRole } from "discord.js";
import type Role from "../../domain/types/role";

interface CreateRoleNotFoundParams {
  guild: Guild;
  role: Role;
}

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
