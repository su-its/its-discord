import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../../domain/types/command";
import { DIContainer } from "../../../../application/services/DIContainer";
import logger from "../../../../infrastructure/logger";

const authCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("auth")
    .setDescription("認証コマンド"),
  execute: authCommandHandler,
  isDMAllowed: false,
};

async function authCommandHandler(interaction: CommandInteraction) {
  // ギルドコンテキストの確認
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ このコマンドはサーバー内でのみ使用できます。",
      ephemeral: true,
    });
    return;
  }

  // 応答を遅延させる（処理時間がかかるため）
  await interaction.deferReply({ ephemeral: true });

  try {
    // DIコンテナから新しいUseCaseを取得
    const diContainer = DIContainer.getInstance();
    
    // イベントハンドラーのセットアップ
    diContainer.setupEventHandlers(interaction.guild.id);
    
    const authenticateMemberUseCase = diContainer.getAuthenticateMemberUseCase();

    // 新しいUseCaseで認証処理を実行
    const result = await authenticateMemberUseCase.execute({
      discordId: interaction.user.id
    });

    if (result.isFailure()) {
      const error = result.getError();
      await interaction.editReply(`❌ ${error.message}`);
      logger.warn(`Authentication failed for user ${interaction.user.id}: ${error.message}`);
      return;
    }

    const response = result.getValue();
    await interaction.editReply(
      `✅ ${response.message}\n\n` +
      `**付与されたロール:** ${response.assignedRoles.join(", ")}\n` +
      `**ニックネーム:** ${response.nickname || "設定されていません"}`
    );

    logger.info(`Authentication completed for user ${interaction.user.id}, member: ${response.memberName}`);
  } catch (error) {
    logger.error(`Error in auth command for user ${interaction.user.id}:`, error);
    await interaction.editReply(
      "❌ エラーが発生しました。時間をおいてもう一度お試しください。"
    );
  }
}

export default authCommand;
