import { CommandInteraction } from "discord.js";
import administratorRoleProperty from "../roles/administrator";

async function checkIsAdmin(interaction: CommandInteraction): Promise<boolean> {
  const member = await interaction.guild!.members.fetch(interaction.user.id);
  const isAdmin: boolean = member.roles.cache.some((role) => role.name === administratorRoleProperty.roleName);
  return isAdmin;
}

export default checkIsAdmin;
