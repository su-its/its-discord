import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../domain/types/command";
import checkIsAdmin from "../../utils/checkMemberRole";

const killCommand: Command = {
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
  if (!isAdmin) {
    await interaction.reply("このコマンドは管理者のみ使用可能です。");
    return;
  }

  const targetPid = interaction.options.get("pid")?.value as string;
  const currentPid = process.pid.toString();

  if (!targetPid) {
    await interaction.reply("PIDを指定してください");
    return;
  }
  if (targetPid && targetPid === currentPid) {
    await interaction.reply(`プロセス ${currentPid} を終了します...`);
    process.exit(0);
  } else {
    await interaction.reply(
      `PID ${targetPid} は現在のプロセスではありません。`,
    );
  }
}

export default killCommand;
