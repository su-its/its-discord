import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type CommandWithArgs from "../types/commandWithArgs";
import checkIsAdmin from "../utils/checkMemberRole";

const killCommand: CommandWithArgs = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("指定されたボットプロセスを終了します")
    .addStringOption((option) =>
      option
        .setName("pid")
        .setDescription("終了するプロセスのPID")
        .setRequired(true),
    ) as SlashCommandBuilder,
  execute: killCommandHandler,
};

async function killCommandHandler(interaction: CommandInteraction) {
  //adminロールを持っているか確認
  const isAdmin: boolean = await checkIsAdmin(interaction);
  if (!isAdmin)
    return await interaction.reply("このコマンドは管理者のみ使用可能です。");

  const targetPid = interaction.options.get("pid")?.value as string;
  const currentPid = process.pid.toString();

  if (!targetPid) return await interaction.reply("PIDを指定してください");
  if (targetPid && targetPid === currentPid) {
    console.log(`Killing process ${currentPid}`);
    await interaction.reply(`プロセス ${currentPid} を終了します...`);
    process.exit(0);
  } else {
    await interaction.reply(
      `PID ${targetPid} は現在のプロセスではありません。`,
    );
  }
}

export default killCommand;
