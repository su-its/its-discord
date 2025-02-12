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
import logger from "../../../infrastructure/logger";
import addRoleToMember from "../../../utils/addRoleToMember";
import createRoleIfNotFound from "../../../utils/createRoleNotFound";
import {
  getMemberByDiscordIdController,
  getMemberByEmailController,
} from "../../controllers/MemberController";
import roleRegistry from "../../roles";
import { departmentRoleKeys } from "../../roles/implementations/categories/departments";

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
  if (user.emailVerified) {
    try {
      await changeNickName(interaction, member);
      await giveRoles(interaction);
    } catch (error) {
      logger.error("Failed to auth", error);
      await interaction.reply("認証に失敗しました");
    }
  } else {
    await interaction.reply("メール認証が完了していません");
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

async function giveRoles(interaction: CommandInteraction) {
  const user = await adminAuth.getUserByEmail(interaction.user.tag);
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
  try {
    const authorizedRole: Role = await createRoleIfNotFound({
      guild,
      role: roleRegistry.getRole("Authorized"),
    });
    const unAuthorizedRole: Role = await createRoleIfNotFound({
      guild,
      role: roleRegistry.getRole("UnAuthorized"),
    });

    await guildMember.roles.add(authorizedRole);
    await guildMember.roles.remove(unAuthorizedRole);

    await interaction.reply("認証しました!");
  } catch (error) {
    logger.error("Failed to give Authorized Role", error);
  }
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
    [Department.CS]: roleRegistry.getRole(departmentRoleKeys.csRoleKey),
    [Department.IA]: roleRegistry.getRole(departmentRoleKeys.iaRoleKey),
    [Department.BI]: roleRegistry.getRole(departmentRoleKeys.biRoleKey),
    [Department.GRADUATE]: roleRegistry.getRole(
      departmentRoleKeys.graduateRoleKey,
    ),
    [Department.OTHERS]: roleRegistry.getRole(departmentRoleKeys.othersRoleKey),
    [Department.OBOG]: roleRegistry.getRole(departmentRoleKeys.obOgRoleKey), // OBOGロールを追加
  };

  const role = departmentRoleMap[member.department];
  if (!role) {
    throw new Error("Department not found");
  }

  await addRoleToMember(guild, guildMember, role);
}

export default authCommand;
