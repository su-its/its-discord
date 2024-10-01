import type { Guild, GuildMember } from "discord.js";
import type CustomRole from "../types/customRole";
import createRoleIfNotFound from "./createRoleNotFound";

async function addRoleToMember(
  guild: Guild,
  member: GuildMember,
  customRole: CustomRole,
) {
  try {
    const role = await createRoleIfNotFound({ guild, customRole: customRole });
    await member.roles.add(role);
  } catch (error) {
    console.error("Failed to add role to member");
  }
}

export default addRoleToMember;
