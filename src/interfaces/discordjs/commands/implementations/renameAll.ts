import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { DIContainer } from "../../../../application/services/DIContainer";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const renameAll: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("rename_all")
    .setDescription("全員のニックネームを変更する"),
  execute: renameAllHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function renameAllHandler(interaction: CommandInteraction) {
  if (!interaction.guild) throw new Error("Guild not found");

  // NOTE: 応答がタイムアウトしないように遅延させる
  await interaction.deferReply();

  try {
    const diContainer = DIContainer.getInstance();
    const renameAllMembersUseCase = diContainer.getRenameAllMembersUseCase();

    const result = await renameAllMembersUseCase.execute({
      guildId: interaction.guild.id,
    });

    if (result.isSuccess()) {
      const { successCount, failureCount, failedMemberIds } = result.getValue();
      const failedMembersMessage =
        failedMemberIds.length > 0
          ? failedMemberIds.length >= 10
            ? "\n※10人以上のメンバーの変更に失敗しました。詳細はログを確認してください。"
            : `\n失敗したメンバーID:\n${failedMemberIds.slice(0, 10).join("\n")}`
          : "";
      await interaction.followUp(
        `ニックネームの変更が完了しました。\n成功: ${successCount}件\n失敗: ${failureCount}件${failedMembersMessage}`,
      );
    } else {
      await interaction.followUp(
        `ニックネームの一括変更中にエラーが発生しました: ${result.getError().message}`,
      );
    }
  } catch (error) {
    await interaction.followUp(
      "ニックネームの一括変更中に予期しないエラーが発生しました。後でもう一度お試しください。",
    );
  }
}

export default renameAll;
