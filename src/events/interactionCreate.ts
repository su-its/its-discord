import { Events } from "discord.js";
import { CustomClient } from "../types/customClient";

export function setupInteractionCreateHandler(client: CustomClient) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const replyContent = { content: "There was an error while executing this command!", ephemeral: true };
      interaction.replied || interaction.deferred
        ? await interaction.followUp(replyContent)
        : await interaction.reply(replyContent);
    }
  });
}
