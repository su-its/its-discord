import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../domain/types/command";
import logger from "../../../infrastructure/logger";
import { getMemberByDiscordIdController } from "../../controllers/MemberController";
import checkIsAdmin from "../../utils/checkMemberRole";

const renameALL: Command = {
  data: new SlashCommandBuilder()
    .setName("rename_all")
    .setDescription("全員のニックネームを変更する"),
  execute: renameALLHandler,
};

async function renameALLHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
    return;
  }

  const isAdmin = await checkIsAdmin(interaction);
  if (!isAdmin) {
    await interaction.reply("このコマンドは管理者のみ使用可能です。");
    return;
  }

  // 応答がタイムアウトしないように遅延させる
  await interaction.deferReply();

  const members = await interaction.guild.members.fetch();
  let successCount = 0;
  let failureCount = 0;
  const renamePromises = members.map(async (member) => {
    try {
      const registeredMember = await getMemberByDiscordIdController(member.id);
      if (!registeredMember) {
        // NOTE: DiscordIDとの紐づけが行われていないユーザーもいるため、無視する
        return;
      }

      await member.setNickname(registeredMember.name);
      successCount++;
    } catch (error) {
      // NOTE: ニックネーム変更に一人が失敗しても全体の処理を止めない
      failureCount++;
      // NOTE: 例外に関しては全体の処理を止めずにログ出力する
      logger.error(`Failed to rename ${member}: ${error}`);
    }
  });

  await Promise.all(renamePromises);
  await interaction.followUp(
    `ニックネームの変更が完了しました。\n成功: ${successCount}件\n失敗: ${failureCount}件`,
  );
}

export default renameALL;
