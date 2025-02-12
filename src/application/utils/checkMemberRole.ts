import type { CommandInteraction } from "discord.js";
import administratorRoleProperty from "../roles/implementations/administrator";

async function checkIsAdmin(interaction: CommandInteraction): Promise<boolean> {
  const guild = interaction.guild;
  if (!guild) {
    return false;
  }

  const member = await guild.members.fetch(interaction.user.id);
  const isAdmin: boolean = member.roles.cache.some(
    (role) => role.name === administratorRoleProperty.name,
  );
  return isAdmin;
}

export default checkIsAdmin;
