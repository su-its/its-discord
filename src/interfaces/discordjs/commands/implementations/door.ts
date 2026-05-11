import type { AppDeps } from "@application/ports";
import type Command from "@domain/types/command";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const doorCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("door")
    .setDescription("ITSの開室状況を表示します") as SlashCommandBuilder,
  execute: doorCommandHandler,
  isDMAllowed: true,
};

async function doorCommandHandler(
  interaction: ChatInputCommandInteraction,
  deps: AppDeps,
) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const status = await deps.doorStatusPort.fetchStatus();
    const text = status.message ?? (status.isOpen ? "🟢 開室中" : "🔴 閉室中");
    await interaction.editReply(`現在の開室状況: ${text}`);
  } catch {
    await interaction.editReply("現在の開室状況: ❌ 通信に失敗しました");
  }
}

export default doorCommand;
