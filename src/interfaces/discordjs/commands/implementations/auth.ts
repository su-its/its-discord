import { type CommandInteraction, type Guild, type GuildMember, SlashCommandBuilder } from "discord.js";
import type { UserRecord } from "firebase-admin/lib/auth/user-record";
import roleRegistry, { roleRegistryKeys } from "../../../../domain/types/roles";
import removeRole from "../../../../infrastructure/discordjs/addRole";
import { firebaseAuthService } from "../../../../infrastructure/firebase";
import { toInternalMember } from "../../../../infrastructure/itscore/mapper";
import { memberUsecase } from "../../../../infrastructure/itscore/usecases";
import giveDepartmentRole from "../../../../infrastructure/discordjs/giveDepartmentRole";
import addRole from "../../../../infrastructure/discordjs/addRole";
import type Command from "../../../../domain/types/command";

const authCommand: Command = {
  data: new SlashCommandBuilder().setName("auth").setDescription("認証コマンド"),
  execute: authCommandHandler,
  isDMAllowed: false,
};

async function authCommandHandler(interaction: CommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    throw new Error("Guild not found");
  }
  const guildMember = await guild.members.fetch(interaction.user.id);
  if (!guildMember) {
    throw new Error("Guild member not found");
  }

  await interaction.deferReply();

  try {
    const itsMember = await memberUsecase.getMemberByDiscordId.execute({
      discordId: interaction.user.id,
    });
    if (!itsMember) {
      await interaction.editReply("メンバー情報がITSCoreに存在しません。管理者に連絡してください。");
      return;
    }
    const member = toInternalMember(itsMember);

    const user: UserRecord = await firebaseAuthService.getUserByEmail(member.mail);
    if (!user.emailVerified) {
      await interaction.editReply(
        "メール認証が完了していません。もう一度認証メールを確認するか、認証プロセスをやり直してください。"
      );
      return;
    }

    await giveDepartmentRole(guild, guildMember, member);
    await addRole(guild, guildMember, roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey));
    await removeRole(guild, guildMember, roleRegistry.getRole(roleRegistryKeys.unAuthorizedRoleKey));
    await guildMember.setNickname(member.name);

    await interaction.editReply("認証に成功しました! ITSへようこそ!");
  } catch (error) {
    await interaction.editReply("認証に失敗しました");
    throw error;
  }
}

export default authCommand;
