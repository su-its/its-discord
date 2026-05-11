import type { AppDeps } from "@application/ports";
import { getProcessInfo } from "@application/usecases";
import type AdminCommand from "@domain/types/adminCommand";
import { AdminRoleSpecification } from "@infrastructure/authorization";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const psCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("ps")
    .setDescription("現在のボットプロセス情報を表示します"),
  execute: psCommandHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: true,
};

async function psCommandHandler(
  interaction: ChatInputCommandInteraction,
  _deps: AppDeps,
) {
  const processInfo = await getProcessInfo();
  await interaction.reply(
    `ボットプロセス情報:\nPID: ${processInfo.pid}\nホスト名: ${processInfo.hostname}`,
  );
}

export default psCommand;
