import type { AppDeps } from "@application/ports";
import { renameAllMembersInGuild } from "@application/usecases";
import type AdminCommand from "@domain/types/adminCommand";
import { AdminRoleSpecification } from "@infrastructure/authorization";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const renameAll: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("rename_all")
    .setDescription("全員のニックネームを変更する"),
  execute: renameAllHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function renameAllHandler(
  interaction: ChatInputCommandInteraction,
  deps: AppDeps,
) {
  if (!interaction.guild) throw new Error("Guild not found");

  await interaction.deferReply();

  const { successCount, failureCount, failedMembers } =
    await renameAllMembersInGuild(interaction.guild.id, deps);
  const failedMembersMessage =
    failedMembers.length > 0
      ? failedMembers.length >= 10
        ? "\n※10人以上のメンバーの変更に失敗しました。詳細はログを確認してください。"
        : `\n失敗したメンバー:\n${failedMembers.map((m) => m.displayName).join("\n")}`
      : "";
  await interaction.followUp(
    `ニックネームの変更が完了しました。\n成功: ${successCount}件\n失敗: ${failureCount}件${failedMembersMessage}`,
  );
}

export default renameAll;
