import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { itsCoreService } from "../../../../application/services/itsCoreService";
import Department from "../../../../domain/entities/department";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const registerCommand: AdminCommand = {
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
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function addMemberCommandHandler(interaction: CommandInteraction) {
  const mail = interaction.options.get("mail")?.value as string;
  const name = interaction.options.get("name")?.value as string;
  const department = interaction.options.get("department")?.value as string;
  const studentNumber = interaction.options.get("student_number")
    ?.value as string;
  //引数が正しいか確認
  const isArgsValid: boolean = validateArgs(mail, department, studentNumber);

  if (!isArgsValid) {
    await interaction.reply("引数が不正です。");
    return;
  }

  await itsCoreService.registerMember({
    email: mail,
    name: name,
    department: department,
    studentId: studentNumber,
  });

  await interaction.reply(`${name}さんを登録しました`);
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
