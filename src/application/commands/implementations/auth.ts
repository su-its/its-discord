import {
  type CommandInteraction,
  type Guild,
  type GuildMember,
  type Role,
  SlashCommandBuilder,
} from "discord.js";
import type { UserRecord } from "firebase-admin/lib/auth/user-record";
import Department from "../../../domain/entities/department";
import type Member from "../../../domain/entities/member";
import type Command from "../../../domain/types/command";
import { adminAuth } from "../../../infrastructure/firebase";
import {
  getMemberByDiscordIdController,
  getMemberByEmailController,
} from "../../controllers/MemberController";
import roleRegistry, { roleRegistryKeys } from "../../roles";
import addRoleToMember from "../../utils/addRoleToMember";
import createRoleIfNotFound from "../../utils/createRoleNotFound";

const authCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("auth")
    .setDescription("認証コマンド"),
  execute: authCommandHandler,
};

async function authCommandHandler(interaction: CommandInteraction) {
  //DMでは実行できないようにする
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバーでのみ実行可能です");
    return;
  }

  // Firestoreからメンバー情報を取得
  const member = await getMemberByDiscordIdController(interaction.user.id);
  if (!member) {
    await interaction.reply("メンバー情報が見つかりませんでした");
    return;
  }

  // メール認証が完了しているか確認
  const user: UserRecord = await adminAuth.getUserByEmail(member.mail);
  if (!user.emailVerified) {
    await interaction.reply("メール認証が完了していません");
    return;
  }
  try {
    await changeNickName(interaction, member);
    await giveRoles(interaction, member);
  } catch (error) {
    await interaction.reply("認証に失敗しました");
    throw error;
  }
}

async function changeNickName(interaction: CommandInteraction, member: Member) {
  const guild = interaction.guild;
  if (!guild) {
    throw new Error("This command can only be used in a guild.");
  }
  const guildMember = await guild.members.fetch(interaction.user.id);
  const realName = member.name;
  await guildMember.setNickname(realName);
}

async function giveRoles(interaction: CommandInteraction, member: Member) {
  const user = await adminAuth.getUserByEmail(member.mail);
  const guild = interaction.guild;
  if (!guild) {
    throw new Error("This command can only be used in a guild.");
  }
  const guildMember = await guild.members.fetch(interaction.user.id);
  await giveAuthorizedRole(interaction, guild, guildMember);
  await giveDepartmentRole(interaction, user, guildMember);
}

async function giveAuthorizedRole(
  interaction: CommandInteraction,
  guild: Guild,
  guildMember: GuildMember,
) {
  const authorizedRole: Role = await createRoleIfNotFound({
    guild,
    role: roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey),
  });
  const unAuthorizedRole: Role = await createRoleIfNotFound({
    guild,
    role: roleRegistry.getRole(roleRegistryKeys.unAuthorizedRoleKey),
  });

  await guildMember.roles.add(authorizedRole);
  await guildMember.roles.remove(unAuthorizedRole);

  await interaction.reply("認証しました!");
}

async function giveDepartmentRole(
  interaction: CommandInteraction,
  userAccount: UserRecord,
  guildMember: GuildMember,
) {
  const guild = interaction.guild;
  if (!guild) {
    throw new Error("Guild not found");
  }

  if (!userAccount.email) {
    throw new Error("User email not found");
  }

  // 認証用のアカウントから、メンバー情報を取得
  const member = await getMemberByEmailController(userAccount.email);
  if (!member) {
    throw new Error("Member not found");
  }

  const departmentRoleMap = {
    [Department.CS]: roleRegistry.getRole(roleRegistryKeys.csRoleKey),
    [Department.IA]: roleRegistry.getRole(roleRegistryKeys.iaRoleKey),
    [Department.BI]: roleRegistry.getRole(roleRegistryKeys.biRoleKey),
    [Department.GRADUATE]: roleRegistry.getRole(
      roleRegistryKeys.graduateRoleKey,
    ),
    [Department.OTHERS]: roleRegistry.getRole(roleRegistryKeys.othersRoleKey),
    [Department.OBOG]: roleRegistry.getRole(roleRegistryKeys.obOgRoleKey),
  };

  const role = departmentRoleMap[member.department];

  await addRoleToMember(guild, guildMember, role);
}

export default authCommand;
