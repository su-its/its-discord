import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type CommandWithArgs from "../types/commandWithArgs";

const killCommand: CommandWithArgs = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("指定されたボットプロセスを終了します")
    .addStringOption((option) => option.setName("pid").setDescription("終了するプロセスのPID").setRequired(true)),
  execute: killCommandHandler,
};

async function killCommandHandler(interaction: CommandInteraction) {
  const targetPid = interaction.options.get("pid");
  const currentPid = process.pid.toString();

  if (!targetPid) return await interaction.reply("PIDを指定してください");
  if (targetPid === currentPid) {
    console.log(`Killing process ${currentPid}`);
    await interaction.reply(`プロセス ${currentPid} を終了します...`);
    process.exit(0);
  } else {
    await interaction.reply(`PID ${targetPid} は現在のプロセスではありません。`);
  }
}

export default killCommand;
