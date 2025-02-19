import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import Department from "../../../domain/entities/department";
import type Command from "../../../domain/types/command";
import { addMemberController } from "../../controllers/MemberController";
import type { MemberCreateInput } from "../../repository/IMemberRepository";
import checkIsAdmin from "../../utils/checkMemberRole";

const registerCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("認証コマンド")
    .addStringOption((option) =>
      option.setName("mail").setDescription("メールアドレス").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("name").setDescription("名前").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("department").setDescription("学部").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("student_number")
        .setDescription("学籍番号")
        .setRequired(true),
    ) as SlashCommandBuilder,
  execute: addMemberCommandHandler,
};

async function addMemberCommandHandler(interaction: CommandInteraction) {
  //DMでは使用不可
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
    return;
  }

  //adminロールを持っているか確認
  const isAdmin: boolean = await checkIsAdmin(interaction);
  if (!isAdmin) {
    await interaction.reply("このコマンドは管理者のみ使用可能です。");
    return;
  }

  //引数が正しいか確認
  const isArgsValid: boolean = validateArgs(
    interaction.options.get("mail")?.value as string,
    interaction.options.get("department")?.value as string,
    interaction.options.get("student_number")?.value as string,
  );
  if (!isArgsValid) {
    await interaction.reply("引数が不正です。");
    return;
  }

  await addMemberController({
    mail: interaction.options.get("mail")?.value as string,
    name: interaction.options.get("name")?.value as string,
    department: interaction.options.get("department")?.value as string,
    student_number: interaction.options.get("student_number")?.value as string,
  } as MemberCreateInput);

  await interaction.reply(
    `${interaction.options.get("name")?.value}さんを登録しました`,
  );
}

function validateArgs(
  mail: string,
  department: string,
  studentNumber: string,
): boolean {
  return (
    validateEmail(mail) &&
    validateStudentNumber(studentNumber) &&
    validateDepartment(department)
  );
}

function validateEmail(email: string): boolean {
  // mailが@shizuoka.ac.jpで終わっているか検証
  return email.endsWith("@shizuoka.ac.jp");
}

function validateStudentNumber(studentNumber: string): boolean {
  return studentNumber.startsWith("7") || studentNumber.length === 8;
}

function validateDepartment(department: string): boolean {
  return Object.values(Department).includes(department as Department);
}

export default registerCommand;
