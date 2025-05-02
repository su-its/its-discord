import { type CommandInteraction, type GuildMember, SlashCommandBuilder } from "discord.js";
import { renameAllMembersInGuild } from "../../../../application/usecases/renameAllMembersInGuild";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const renameAll: AdminCommand = {
  data: new SlashCommandBuilder().setName("rename_all").setDescription("全員のニックネームを変更する"),
  execute: renameAllHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function renameAllHandler(interaction: CommandInteraction) {
  if (!interaction.guild) throw new Error("Guild not found");

  // NOTE: 応答がタイムアウトしないように遅延させる
  await interaction.deferReply();

  const { successCount, failureCount, failedMembers } = await renameAllMembersInGuild(interaction.guild);
  const failedMembersMessage =
    failedMembers.length > 0
      ? failedMembers.length >= 10
        ? "\n※10人以上のメンバーの変更に失敗しました。詳細はログを確認してください。"
        : `\n失敗したメンバー:\n${failedMembers.join("\n")}`
      : "";
  await interaction.followUp(
    `ニックネームの変更が完了しました。\n成功: ${successCount}件\n失敗: ${failureCount}件${failedMembersMessage}`
  );
}

export default renameAll;
