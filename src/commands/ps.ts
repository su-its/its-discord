import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type CommandWithArgs from "../types/commandWithArgs";


const psCommand: CommandWithArgs = {
  data: new SlashCommandBuilder().setName("ps").setDescription("現在のボットプロセス情報を表示します"),
  execute: psCommandHandler,
};

async function psCommandHandler(interaction: CommandInteraction) {
  const processInfo = await getProcessInfo();
  await interaction.reply(`ボットプロセス情報:\nPID: ${processInfo.pid}\nホスト名: ${processInfo.hostname}`);
}

async function getProcessInfo(): Promise<{ pid: number; hostname: string }> {
  return {
    pid: process.pid,
    hostname: os.hostname(),
  };
}

export default psCommand;
