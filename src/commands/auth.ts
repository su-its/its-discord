import { SlashCommandBuilder, CommandInteraction, Guild, Role } from "discord.js";
import { Command } from "../types/command";
import { adminAuth } from "../infra/firebase";
import { getMemberByDiscordId } from "../controllers/MemberController";
import createRoleIfNotFound from "../utils/createRoleNotFound";
import authorizedRoleProperty from "../roles/authorized";
import unAuthorizedRoleProperty from "../roles/unAuthorized";

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

  const user = await adminAuth.getUserByEmail(member.mail);
  if (user.emailVerified) {
    try {
      await giveAuthorizedRole(interaction);
    } catch (error) {
      await interaction.reply("認証に失敗しました");
    }
  } else {
    await interaction.reply("メール認証が完了していません");
  }
}

async function giveAuthorizedRole(interaction: CommandInteraction) {
  try {
    const guild: Guild = interaction.guild!;
    const authorizedRole: Role = await createRoleIfNotFound({ guild, customRole: authorizedRoleProperty });
    const unAuthorizedRole: Role = await createRoleIfNotFound({ guild, customRole: unAuthorizedRoleProperty });

    const guildMember = await guild.members.fetch(interaction.user.id);
    await guildMember.roles.add(authorizedRole);
    await guildMember.roles.remove(unAuthorizedRole);

    await interaction.reply("認証しました!");
  } catch (error) {
    console.error("Failed to give Authorized Role");
  }
}

export default authCommand;
