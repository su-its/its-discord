import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { itsCoreService } from "../../../../application/services/itsCoreService";
import { authenticateUser } from "../../../../application/usecases/authenticateUser";
import type Command from "../../../../domain/types/command";

export const AUTH_MODAL_ID = "auth-email-modal";
export const AUTH_EMAIL_INPUT_ID = "auth-email-input";

const authCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("auth")
    .setDescription("認証コマンド"),
  execute: authCommandHandler,
  isDMAllowed: false,
};

async function authCommandHandler(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    throw new Error("Guild not found");
  }

  const existingMember = await itsCoreService.getMemberByDiscordId(
    interaction.user.id,
  );

  if (existingMember) {
    await interaction.deferReply({ ephemeral: true });
    const result = await authenticateUser(
      interaction.user.id,
      interaction.guild.id,
    );
    await interaction.editReply(result.message);
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(AUTH_MODAL_ID)
    .setTitle("メール認証");

  const emailInput = new TextInputBuilder()
    .setCustomId(AUTH_EMAIL_INPUT_ID)
    .setLabel("静岡大学のメールアドレス")
    .setPlaceholder("example@shizuoka.ac.jp")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
  );

  await interaction.showModal(modal);
}

export default authCommand;
