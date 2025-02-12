import { Events } from "discord.js";
import type { CustomClient } from "../../domain/types/customClient";
import logger from "../../infrastructure/logger";

export function setupInteractionCreateHandler(client: CustomClient): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      logger.error(
        `No command matching "${interaction.commandName}" was found.`,
      );
      return;
    }

    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const options = interaction.options.data;

    logger.info(
      `Command executed: ${interaction.commandName} | User: ${userId} | Guild: ${guildId} | Options: ${JSON.stringify(options)}`,
    );

    try {
      await command.execute(interaction);
      logger.info(
        `Command completed: ${interaction.commandName} | User: ${userId} | Guild: ${guildId}`,
      );
    } catch (error) {
      logger.error(
        `Command failed: ${interaction.commandName} | User: ${userId} | Guild: ${guildId} | Error: ${error}`,
      );

      const commandErrorMessage = {
        content:
          "コマンド実行時にエラーが発生しました．管理者にお問い合わせください．",
        ephemeral: true,
      };

      // NOTE: コマンドがすでに返信済みか、遅延している場合は、フォローアップで返信する
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(commandErrorMessage);
      } else {
        await interaction.reply(commandErrorMessage);
      }
    }
  });
}
