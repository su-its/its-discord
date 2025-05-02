import { createMemberUseCases } from "@shizuoka-its/core";
import { type CommandInteraction, type GuildMember, SlashCommandBuilder } from "discord.js";
import type AdminCommand from "../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../infrastructure/authorization/adminRoleSpecification";
import logger from "../../../infrastructure/logger";
import checkIsAdmin from "../../utils/checkMemberRole";

const memberUsecase = createMemberUseCases();

const renameALL: AdminCommand = {
  data: new SlashCommandBuilder().setName("rename_all").setDescription("全員のニックネームを変更する"),
  execute: renameALLHandler,
  authorization: new AdminRoleSpecification(),
};

async function renameALLHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
    return;
  }

  // 応答がタイムアウトしないように遅延させる
  await interaction.deferReply();

  const members = await interaction.guild.members.fetch();
  let successCount = 0;
  let failureCount = 0;
  const failedMembers: GuildMember[] = [];
  const renamePromises = members.map(async (member) => {
    try {
      const registeredMember = await memberUsecase.getMemberByDiscordId.execute({
        discordId: member.id,
      });
      if (!registeredMember) {
        // NOTE: DiscordIDとの紐づけが行われていないユーザーもいるため、無視する
        return;
      }

      await member.setNickname(registeredMember.name);
      successCount++;
    } catch (error) {
      // NOTE: ニックネーム変更に一人が失敗しても全体の処理を止めない
      failureCount++;
      failedMembers.push(member);
      // NOTE: 例外に関しては全体の処理を止めずにログ出力する
      logger.error(`Failed to rename ${member}: ${error}`);
    }
  });

  await Promise.all(renamePromises);
  const failedMembersMessage =
    failedMembers.length > 0
      ? failedMembers.length >= 10
        ? "\n※10人以上のメンバーの変更に失敗しました。詳細はログを確認してください。"
        : `\n失敗したメンバー:\n${failedMembers.join("\n")}`
      : "";
  await interaction.followUp(
    `ニックネームの変更が完了しました。\n成功: ${successCount}件\n失敗: ${failureCount}件${failedMembersMessage}`
  );
}

export default renameALL;
