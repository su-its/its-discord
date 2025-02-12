import type { Guild, Role as OriginalRole } from "discord.js";
import type Role from "../domain/types/role";
import logger from "../infrastructure/logger";
type createRoleNotFoundParams = {
  guild: Guild;
  role: Role;
};

async function createRoleIfNotFound({
  guild,
  role,
}: createRoleNotFoundParams): Promise<OriginalRole> {
  const roles = await guild.roles.fetch();
  let originalRole: OriginalRole | undefined = roles.find(
    (r) => r.name === role.name,
  );
  if (!originalRole) {
    try {
      originalRole = await guild.roles.create({
        name: role.name,
        color: role.color,
        reason: role.reason,
      });
      logger.debug(`${role.name} role created.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error creating ${role.name} role:`, error);
      } else {
        logger.error(`Error creating ${role.name} role:`, error);
      }
      throw error;
    }
  }
  return originalRole;
}

export default createRoleIfNotFound;
