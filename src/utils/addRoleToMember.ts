import type { Guild, GuildMember, Role as OriginalRole } from "discord.js";
import type Role from "../domain/types/role";
import logger from "../infrastructure/logger";
import createRoleIfNotFound from "./createRoleNotFound";

async function addRoleToMember(guild: Guild, member: GuildMember, role: Role) {
  try {
    const originalRole: OriginalRole = await createRoleIfNotFound({
      guild,
      role,
    });
    await member.roles.add(originalRole);
  } catch (error) {
    logger.error("Failed to add role to member");
    throw new Error("Failed to add role to member");
  }
}

export default addRoleToMember;
