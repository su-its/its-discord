import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../../domain/types/command";
import Department from "../../../../domain/entities/department";
import { DIContainer } from "../../../../application/services/DIContainer";
import { DepartmentAdapter } from "../../../../infrastructure/adapters/DepartmentAdapter";
import logger from "../../../../infrastructure/logger";

const dmAuthCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("dmauth")
    .setDescription("DM認証コマンド - 一度にすべての情報を入力して認証を完了させます")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("名前（フルネーム）")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("student_number")
        .setDescription("学籍番号（8文字の英数字）")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("department")
        .setDescription("学科")
        .setRequired(true)
        .addChoices(
          { name: "CS", value: Department.CS },
          { name: "IA", value: Department.IA },
          { name: "BI", value: Department.BI },
          { name: "GRADUATE", value: Department.GRADUATE },
          { name: "OTHERS", value: Department.OTHERS },
          { name: "OBOG", value: Department.OBOG }
        )
    )
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("メールアドレス（@shizuoka.ac.jpで終わるもの）")
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: dmAuthCommandHandler,
  isDMAllowed: true,
};

async function dmAuthCommandHandler(interaction: CommandInteraction) {
  // DM専用コマンドとして実行
  if (!interaction.channel?.isDMBased()) {
    await interaction.reply({
      content: "このコマンドはDMでのみ使用できます。",
      ephemeral: true,
    });
    return;
  }

  // 処理時間がかかるため応答を遅延
  await interaction.deferReply({ ephemeral: true });

  try {
    // オプションから値を取得
    const name = interaction.options.get("name", true).value as string;
    const studentNumber = interaction.options.get("student_number", true).value as string;
    const oldDepartment = interaction.options.get("department", true).value as Department;
    const email = interaction.options.get("email", true).value as string;

    // 新しいUseCaseを使用
    const diContainer = DIContainer.getInstance();
    const registerMemberUseCase = diContainer.getRegisterMemberUseCase();

    // Department の変換
    const departmentResult = DepartmentAdapter.fromOldDepartment(oldDepartment);
    if (departmentResult.isFailure()) {
      await interaction.editReply(
        `❌ 学科の変換でエラーが発生しました: ${departmentResult.getError().message}`
      );
      return;
    }

    // UseCase実行
    const result = await registerMemberUseCase.execute({
      name,
      studentNumber,
      email,
      department: departmentResult.getValue().getValue(),
      discordId: interaction.user.id
    });

    if (result.isFailure()) {
      const error = result.getError();
      await interaction.editReply(
        `❌ ${error.message}`
      );
      logger.warn(`Member registration failed for user ${interaction.user.id}: ${error.message}`);
      return;
    }

    const response = result.getValue();
    await interaction.editReply(
      `✅ ${response.message}\n認証が完了したら、サーバーで \`/auth\` コマンドを実行してロールを取得してください。`
    );
    
    logger.info(`Member registration completed for user: ${interaction.user.id}, member ID: ${response.memberId}`);
  } catch (error) {
    logger.error(`Error in DM auth command for user ${interaction.user.id}:`, error);
    await interaction.editReply(
      "❌ エラーが発生しました。時間をおいてもう一度お試しください。"
    );
  }
}

export default dmAuthCommand;