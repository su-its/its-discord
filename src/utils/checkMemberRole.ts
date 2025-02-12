import type { CommandInteraction } from "discord.js";
import administratorRoleProperty from "../application/roles/implementations/administrator";
import logger from "../infrastructure/logger";

async function checkIsAdmin(interaction: CommandInteraction): Promise<boolean> {
  const guild = interaction.guild;
  if (!guild) {
    return false;
  }

  try {
    const member = await guild.members.fetch(interaction.user.id);
    const isAdmin: boolean = member.roles.cache.some(
      (role) => role.name === administratorRoleProperty.name,
    );
    return isAdmin;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to check if member is admin: ${error.message}`, {
        module: "checkIsAdmin",
        userId: interaction.user.id,
      });
    } else {
      logger.error(
        "Failed to check if member is admin due to an unknown error",
        { module: "checkIsAdmin", userId: interaction.user.id },
      );
    }
    throw new Error("Failed to check if member is admin");
  }
}

export default checkIsAdmin;
