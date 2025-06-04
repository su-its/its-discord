import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { processDMAuthentication } from "../../../../application/usecases/processDMAuthentication";
import type Command from "../../../../domain/types/command";

const authDMCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("auth_dm")
    .setDescription("認証を行います（DMでのみ使用可能）")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("名前（フルネーム）")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("student_number")
        .setDescription("学籍番号（8文字の英数字）")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("department")
        .setDescription("学科")
        .setRequired(true)
        .addChoices(
          { name: "情報科学科", value: "CS" },
          { name: "行動情報学科", value: "BI" },
          { name: "情報社会学科", value: "IA" },
          { name: "大学院生", value: "GRADUATE" },
          { name: "その他", value: "OTHERS" },
          { name: "OB/OG", value: "OBOG" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("メールアドレス（@shizuoka.ac.jpで終わるもの）")
        .setRequired(true),
    ) as SlashCommandBuilder,
  execute: authDMCommandHandler,
  isDMAllowed: true,
};

async function authDMCommandHandler(interaction: CommandInteraction) {
  // DMでのみ実行可能
  if (interaction.guild) {
    await interaction.reply({
      content: "このコマンドはDMでのみ使用可能です。",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const name = interaction.options.get("name")?.value as string;
  const studentNumber = interaction.options.get("student_number")?.value as string;
  const department = interaction.options.get("department")?.value as string;
  const email = interaction.options.get("email")?.value as string;

  try {
    const result = await processDMAuthentication(
      interaction.user.id,
      name,
      studentNumber,
      department,
      email,
    );
    await interaction.editReply(result.message);
  } catch (error) {
    await interaction.editReply(
      "認証処理中にエラーが発生しました。管理者にお問い合わせください。",
    );
  }
}

export default authDMCommand;