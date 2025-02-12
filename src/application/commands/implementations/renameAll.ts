import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../domain/types/command";
import logger from "../../../infrastructure/logger";
import checkIsAdmin from "../../../utils/checkMemberRole";
import { getMemberByDiscordIdController } from "../../controllers/MemberController";

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
  const renamePromises = members.map(async (member) => {
    const memberOnFirebase = await getMemberByDiscordIdController(member.id);
    if (!memberOnFirebase) return;

    try {
      await member.setNickname(memberOnFirebase.name);
      logger.info(
        `[NOTE] Changed nickname of ${member.nickname}, ${memberOnFirebase.name}`,
      );
    } catch (error) {
      logger.error(`[ERROR] Failed to rename ${member.nickname}: ${error}`);
    }
  });

  await Promise.all(renamePromises);
  await interaction.followUp("ニックネームの変更が完了しました。");
  logger.info("[NOTE] Completed changing nicknames");
}

export default renameALL;
