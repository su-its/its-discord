import type { CommandInteraction } from "discord.js";
import administratorRoleProperty from "../../domain/types/roles/implementations/administrator";
import type { AuthorizationSpecification } from "../../domain/types/adminCommand";

export class AdminRoleSpecification implements AuthorizationSpecification {
  constructor(private readonly roleName: string = administratorRoleProperty.name) {}

  async isSatisfiedBy(interaction: CommandInteraction): Promise<boolean> {
    const guild = interaction.guild;
    if (!guild) return false;
    const member = await guild.members.fetch(interaction.user.id);
    return member.roles.cache.some((role) => role.name === this.roleName);
  }
}
