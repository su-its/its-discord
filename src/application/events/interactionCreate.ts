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
        {
          module: "InteractionCreateHandler",
          commandName: interaction.commandName,
        },
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error executing command "${interaction.commandName}": ${error.message}`,
          {
            module: "InteractionCreateHandler",
            stack: error.stack,
          },
        );
      } else {
        logger.error(
          `Unknown error executing command "${interaction.commandName}"`,
          {
            module: "InteractionCreateHandler",
          },
        );
        throw new Error("Unknown error executing command");
      }

      const replyContent = {
        content: "There was an error while executing this command!",
        ephemeral: true,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyContent);
        } else {
          await interaction.reply(replyContent);
        }
      } catch (replyError: unknown) {
        if (replyError instanceof Error) {
          logger.error(
            `Failed to send error reply for command "${interaction.commandName}": ${replyError.message}`,
            {
              module: "InteractionCreateHandler",
            },
          );
        } else {
          logger.error(
            `Unknown error while sending error reply for command "${interaction.commandName}"`,
            {
              module: "InteractionCreateHandler",
            },
          );
          throw new Error(
            "Unknown error while sending error reply for command",
          );
        }
      }
    }
  });
}
