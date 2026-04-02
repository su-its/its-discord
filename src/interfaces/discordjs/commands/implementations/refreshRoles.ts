import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { AppDeps } from "../../../../application/ports/deps";
import { refreshAllMemberRoles } from "../../../../application/usecases/refreshAllMemberRoles";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const refreshRolesCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("refresh_roles")
    .setDescription(
      "全メンバーのロールをITSCoreの最新情報に基づいてリフレッシュする",
    ),
  execute: refreshRolesHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function refreshRolesHandler(
  interaction: ChatInputCommandInteraction,
  deps: AppDeps,
) {
  if (!interaction.guild) throw new Error("Guild not found");

  await interaction.deferReply();

  const { successCount, unregisteredCount, failureCount, failedMembers } =
    await refreshAllMemberRoles(interaction.guild.id, deps);

  const failedMembersMessage =
    failedMembers.length > 0
      ? failedMembers.length >= 10
        ? "\n※10人以上のメンバーのロール更新に失敗しました。詳細はログを確認してください。"
        : `\n失敗したメンバー:\n${failedMembers.map((m) => m.displayName).join("\n")}`
      : "";

  await interaction.followUp(
    `ロールのリフレッシュが完了しました。\n成功: ${successCount}件\n未登録: ${unregisteredCount}件\n失敗: ${failureCount}件${failedMembersMessage}`,
  );
}

export default refreshRolesCommand;
