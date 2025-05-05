import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { killSelf } from "../../../../application/usecases/killSelf";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const killCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("指定されたボットプロセスを終了します")
    .addStringOption((option) =>
      option
        .setName("pid")
        .setDescription("終了するプロセスのPID")
        .setRequired(true),
    ) as SlashCommandBuilder,
  authorization: new AdminRoleSpecification(),
  execute: killCommandHandler,
  isDMAllowed: true,
};

async function killCommandHandler(interaction: CommandInteraction) {
  const targetPid = interaction.options.get("pid", true).value as string;

  await interaction.reply(`プロセス ${targetPid} を終了します...`);
  const result = await killSelf(Number.parseInt(targetPid));
  if (!result) {
    await interaction.editReply(
      `プロセス ${targetPid} を終了できませんでした。`,
    );
  }
}
export default killCommand;
