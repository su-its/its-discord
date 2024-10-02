import * as os from "node:os";
import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type CommandWithArgs from "../types/commandWithArgs";
import checkIsAdmin from "../utils/checkMemberRole";

const psCommand: CommandWithArgs = {
  data: new SlashCommandBuilder()
    .setName("ps")
    .setDescription("現在のボットプロセス情報を表示します"),
  execute: psCommandHandler,
};

async function psCommandHandler(interaction: CommandInteraction) {
  //adminロールを持っているか確認
  const isAdmin: boolean = await checkIsAdmin(interaction);
  if (!isAdmin)
    return await interaction.reply("このコマンドは管理者のみ使用可能です。");

  const processInfo = await getProcessInfo();
  await interaction.reply(
    `ボットプロセス情報:\nPID: ${processInfo.pid}\nホスト名: ${processInfo.hostname}`,
  );
}

async function getProcessInfo(): Promise<{ pid: number; hostname: string }> {
  return {
    pid: process.pid,
    hostname: os.hostname(),
  };
}

export default psCommand;
