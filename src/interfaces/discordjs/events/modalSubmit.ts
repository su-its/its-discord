import { Events, type ModalSubmitInteraction } from "discord.js";
import { linkAndSendVerification } from "../../../application/usecases/linkAndSendVerification";
import type { CustomClient } from "../../../domain/types/customClient";
import logger from "../../../infrastructure/logger";
import {
  AUTH_EMAIL_INPUT_ID,
  AUTH_MODAL_ID,
} from "../commands/implementations/auth";

export function setupModalSubmitHandler(client: CustomClient): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== AUTH_MODAL_ID) return;

    try {
      await handleAuthModalSubmit(interaction);
    } catch (error) {
      logger.error("Unhandled error in modal submit handler:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction
          .reply({
            content: "処理中にエラーが発生しました。管理者に連絡してください。",
            ephemeral: true,
          })
          .catch(() => {});
      }
    }
  });
}

async function handleAuthModalSubmit(
  interaction: ModalSubmitInteraction,
): Promise<void> {
  const email = interaction.fields
    .getTextInputValue(AUTH_EMAIL_INPUT_ID)
    .trim();

  if (!email.endsWith("@shizuoka.ac.jp")) {
    await interaction.reply({
      content:
        "静岡大学のメールアドレス（@shizuoka.ac.jp）を入力してください。",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const result = await linkAndSendVerification(interaction.user.id, email);
  await interaction.editReply(result.message);
}
