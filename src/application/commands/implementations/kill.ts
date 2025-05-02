import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { AdminRoleSpecification } from "../../../infrastructure/authorization/adminRoleSpecification";
import type AdminCommand from "../../../domain/types/adminCommand";

const killCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("指定されたボットプロセスを終了します")
    .addStringOption((option) =>
      option.setName("pid").setDescription("終了するプロセスのPID").setRequired(true)
    ) as SlashCommandBuilder,
  authorization: new AdminRoleSpecification(),
  execute: async function killCommandHandler(interaction: CommandInteraction) {
    const targetPid = interaction.options.get("pid", true).value as string;
    const currentPid = process.pid.toString();

    if (targetPid === currentPid) {
      await interaction.reply(`プロセス ${currentPid} を終了します...`);
      process.exit(0);
    } else {
      await interaction.reply(`PID ${targetPid} は現在のプロセスではありません。`);
    }
  },
};

export default killCommand;
