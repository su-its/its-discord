import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../../domain/types/command";

const healthCheckCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("health_check")
    .setDescription("ヘルスチェックコマンド"),
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply("I am healthy!");
  },
};

export default healthCheckCommand;
