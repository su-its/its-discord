import { SlashCommandBuilder, type CommandInteraction, type Guild, type Role, type GuildMember } from "discord.js";
import type { Command } from "../types/command";
import { adminAuth } from "../infra/firebase";
import { getMemberByDiscordId, getMemberByEmail } from "../controllers/MemberController";
import type { UserRecord } from "firebase-admin/lib/auth/user-record";
import createRoleIfNotFound from "../utils/createRoleNotFound";
import addRoleToMember from "../utils/addRoleToMember";
import Department from "../entities/department";

//以下は、ロールのimport
import biRole from "../roles/departments/bi";
import graduateRole from "../roles/departments/graduate";
import othersRole from "../roles/departments/others";
import obogRole from "../roles/departments/obog";
import csRole from "../roles/departments/cs";
import iaRole from "../roles/departments/ia";
import authorizedRoleProperty from "../roles/authorized";
import unAuthorizedRoleProperty from "../roles/unAuthorized";
import type Member from "../entities/member";

const authCommand: Command = {
  data: new SlashCommandBuilder().setName("auth").setDescription("認証コマンド"),
  execute: authCommandHandler,
};

async function authCommandHandler(interaction: CommandInteraction) {
  //DMでは実行できないようにする
  if (!interaction.guild) return await interaction.reply("このコマンドはサーバーでのみ実行可能です");

  // Firestoreからメンバー情報を取得
  const member = await getMemberByDiscordId(interaction.user.id);
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
      console.error("Failed to auth", error);
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

async function giveAuthorizedRole(interaction: CommandInteraction, guild: Guild, guildMember: GuildMember) {
  try {
    const authorizedRole: Role = await createRoleIfNotFound({
      guild,
      customRole: authorizedRoleProperty,
    });
    const unAuthorizedRole: Role = await createRoleIfNotFound({
      guild,
      customRole: unAuthorizedRoleProperty,
    });

    await guildMember.roles.add(authorizedRole);
    await guildMember.roles.remove(unAuthorizedRole);

    await interaction.reply("認証しました!");
  } catch (error) {
    console.error("Failed to give Authorized Role");
  }
}

async function giveDepartmentRole(interaction: CommandInteraction, userAccount: UserRecord, guildMember: GuildMember) {
  const guild = interaction.guild;
  if (!guild) {
    throw new Error("Guild not found");
  }

  if (!userAccount.email) {
    throw new Error("User email not found");
  }

  // 認証用のアカウントから、メンバー情報を取得
  const member = await getMemberByEmail(userAccount.email);
  if (!member) {
    throw new Error("Member not found");
  }

  const departmentRoleMap = {
    [Department.CS]: csRole,
    [Department.IA]: iaRole,
    [Department.BI]: biRole,
    [Department.GRADUATE]: graduateRole,
    [Department.OTHERS]: othersRole,
    [Department.OBOG]: obogRole, // OBOGロールを追加
  };

  const role = departmentRoleMap[member.department];
  if (!role) {
    throw new Error("Department not found");
  }

  await addRoleToMember(guild, guildMember, role);
}

export default authCommand;
