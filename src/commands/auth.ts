import { SlashCommandBuilder, CommandInteraction, Guild, Role, GuildMember } from "discord.js";
import { Command } from "../types/command";
import { adminAuth } from "../infra/firebase";
import { getMemberByDiscordId, getMemberByEmail } from "../controllers/MemberController";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import createRoleIfNotFound from "../utils/createRoleNotFound";
import addRoleToMember from "../utils/addRoleToMember";
import Department from "../entities/department";

//以下は、ロールのimport
import biRole from "../roles/departments/bi";
import graduateRole from "../roles/departments/graduate";
import othersRole from "../roles/departments/others";
import csRole from "../roles/departments/cs";
import iaRole from "../roles/departments/ia";
import authorizedRoleProperty from "../roles/authorized";
import unAuthorizedRoleProperty from "../roles/unAuthorized";
import Member from "../entities/member";

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
      await giveRoles(interaction, user);
    } catch (error) {
      console.error(error);
      await interaction.reply("認証に失敗しました");
    }
  } else {
    await interaction.reply("メール認証が完了していません");
  }
}

async function giveRoles(interaction: CommandInteraction, user: UserRecord) {
  const guild: Guild = interaction.guild!;
  const guildMember: GuildMember = await guild.members.fetch(interaction.user.id);

  await giveAuthorizedRole(interaction, guild, guildMember);
  await giveDepartmentRole(interaction, user, guildMember);
}

async function giveAuthorizedRole(interaction: CommandInteraction, guild: Guild, guildMember: GuildMember) {
  try {
    const authorizedRole: Role = await createRoleIfNotFound({ guild, customRole: authorizedRoleProperty });
    const unAuthorizedRole: Role = await createRoleIfNotFound({ guild, customRole: unAuthorizedRoleProperty });

    await guildMember.roles.add(authorizedRole);
    await guildMember.roles.remove(unAuthorizedRole);

    await interaction.reply("認証しました!");
  } catch (error) {
    console.error("Failed to give Authorized Role");
  }
}

async function giveDepartmentRole(interaction: CommandInteraction, userAccount: UserRecord, guildMember: GuildMember) {
  const guild: Guild = interaction.guild!;

  //認証用のアカウントから、メンバー情報を取得
  const member: Member | undefined = await getMemberByEmail(userAccount.email!);
  if (!member) {
    throw new Error("Member not found");
    return;
  }

  //TODO: 要リファクタリング
  switch (member.department) {
    case Department.CS:
      await addRoleToMember(guild, guildMember, csRole);
      break;
    case Department.IA:
      await addRoleToMember(guild, guildMember, iaRole);
      break;
    case Department.BI:
      await addRoleToMember(guild, guildMember, biRole);
      break;
    case Department.GRADUATE:
      await addRoleToMember(guild, guildMember, graduateRole);
      break;
    case Department.OTHERS:
      await addRoleToMember(guild, guildMember, othersRole);
      break;
    default:
      throw new Error("Department not found");
  }
}

export default authCommand;
