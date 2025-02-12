import type { Guild, GuildMember, Role as OriginalRole } from "discord.js";
import type Role from "../../domain/types/role";
import createRoleIfNotFound from "./createRoleNotFound";

async function addRoleToMember(guild: Guild, member: GuildMember, role: Role) {
  const originalRole: OriginalRole = await createRoleIfNotFound({
    guild,
    role,
  });
  await member.roles.add(originalRole);
}

export default addRoleToMember;
