import {
  type CommandInteraction,
  type Guild,
  type GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import type { UserRecord } from "firebase-admin/lib/auth/user-record";
import Department from "../../../domain/entities/department";
import type Member from "../../../domain/entities/member";
import type Command from "../../../domain/types/command";
import type CustomRole from "../../../domain/types/role";
import { adminAuth } from "../../../infrastructure/firebase";
import { toInternalMember } from "../../../infrastructure/itscore/mapper";
import { memberUsecase } from "../../../infrastructure/itscore/usecases";
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
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバーでのみ実行可能です");
    return;
  }

  await interaction.deferReply();

  try {
    const itsMember = await memberUsecase.getMemberByDiscordId.execute({
      discordId: interaction.user.id,
    });
    if (!itsMember) {
      await interaction.editReply("メンバー情報が見つかりませんでした");
      return;
    }

    const member = toInternalMember(itsMember);

    const user: UserRecord = await adminAuth.getUserByEmail(member.mail);
    if (!user.emailVerified) {
      await interaction.editReply("メール認証が完了していません");
      return;
    }

    await changeNickName(interaction, member);
    await giveRoles(interaction, member);

    await interaction.editReply("認証しました!");
  } catch (error) {
    await interaction.editReply("認証に失敗しました");
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
  await giveAuthorizedRole(guild, guildMember);
  await giveDepartmentRole(interaction, user, guildMember);
}

async function giveAuthorizedRole(guild: Guild, guildMember: GuildMember) {
  const authorizedRole = await createRoleIfNotFound({
    guild,
    role: roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey),
  });
  const unAuthorizedRole = await createRoleIfNotFound({
    guild,
    role: roleRegistry.getRole(roleRegistryKeys.unAuthorizedRoleKey),
  });

  await guildMember.roles.add(authorizedRole);
  await guildMember.roles.remove(unAuthorizedRole);
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
  const itsMember = await memberUsecase.getMemberByEmail.execute({
    email: userAccount.email,
  });
  if (!itsMember) {
    throw new Error("Member not found");
  }

  const member = toInternalMember(itsMember);

  const departmentRoleMap: Record<string, CustomRole> = {
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
