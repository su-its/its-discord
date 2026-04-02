import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
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
