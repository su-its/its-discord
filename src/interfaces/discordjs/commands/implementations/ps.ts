import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getProcessInfo } from "../../../../application/usecases/getProcessInfo";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const psCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("ps")
    .setDescription("現在のボットプロセス情報を表示します"),
  execute: psCommandHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: true,
};

async function psCommandHandler(interaction: CommandInteraction) {
  const processInfo = await getProcessInfo();
  await interaction.reply(
    `ボットプロセス情報:\nPID: ${processInfo.pid}\nホスト名: ${processInfo.hostname}`,
  );
}

export default psCommand;
