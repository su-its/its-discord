import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../../domain/types/command";
import Department from "../../../../domain/entities/department";
import type { MemberCredentials } from "../../../../domain/types/memberCredentials";
import { verifyMemberCredentials } from "../../../../application/usecases/verifyMemberCredentials";
import handleMemberRegistration from "../../../../application/usecases/authController";
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
    const department = interaction.options.get("department", true).value as Department;
    const email = interaction.options.get("email", true).value as string;

    // 入力値の検証
    if (!/^[a-zA-Z0-9]{8}$/.test(studentNumber)) {
      await interaction.editReply(
        "❌ 学籍番号の形式が正しくありません。8文字の英数字で入力してください。"
      );
      return;
    }

    if (!email.endsWith("@shizuoka.ac.jp")) {
      await interaction.editReply(
        "❌ 静岡大学のメールアドレス（@shizuoka.ac.jpで終わる）を入力してください。"
      );
      return;
    }

    // 認証データの作成
    const credentials: MemberCredentials = {
      discordId: interaction.user.id,
      name: name,
      student_number: studentNumber,
      department: department,
      mail: email,
    };

    // ITSCoreのメンバーリストと照合
    const isAuthenticated = await verifyMemberCredentials(credentials);

    if (!isAuthenticated) {
      await interaction.editReply(
        "❌ 認証に失敗しました。入力した情報がITSメンバーリストと一致しません。"
      );
      logger.warn(`Authentication failed for user: ${interaction.user.id}`);
      return;
    }

    // Firebase認証とメール送信
    await handleMemberRegistration(credentials);
    
    await interaction.editReply(
      "✅ 認証メールを送信しました！メールを確認して認証を完了してください。\n" +
      "認証が完了したら、サーバーで `/auth` コマンドを実行してロールを取得してください。"
    );
    
    logger.info(`Authentication process started for user: ${interaction.user.id}`);
  } catch (error) {
    logger.error(`Error in DM auth command for user ${interaction.user.id}:`, error);
    await interaction.editReply(
      "❌ エラーが発生しました。時間をおいてもう一度お試しください。"
    );
  }
}

export default dmAuthCommand;