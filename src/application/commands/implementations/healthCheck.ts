import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../domain/types/command";

async function healthCheckHandler(interaction: CommandInteraction) {
  await interaction.reply("I am healthy!");
}

const healthCheckCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("health_check")
    .setDescription("ヘルスチェックコマンド"),
  execute: healthCheckHandler,
};

export default healthCheckCommand;
