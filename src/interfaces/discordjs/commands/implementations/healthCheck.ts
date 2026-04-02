import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { AppDeps } from "../../../../application/ports/deps";
import type Command from "../../../../domain/types/command";

const healthCheckCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("health_check")
    .setDescription("ヘルスチェックコマンド"),
  execute: healthCheckHandler,
  isDMAllowed: true,
};

async function healthCheckHandler(
  interaction: ChatInputCommandInteraction,
  _deps: AppDeps,
) {
  await interaction.reply("I am healthy!");
}

export default healthCheckCommand;
