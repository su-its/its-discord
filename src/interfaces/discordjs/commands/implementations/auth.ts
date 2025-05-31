import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { authenticateUser } from "../../../../application/usecases/authenticateUser";
import type Command from "../../../../domain/types/command";

const authCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("auth")
    .setDescription("認証コマンド"),
  execute: authCommandHandler,
  isDMAllowed: false,
};

async function authCommandHandler(interaction: CommandInteraction) {
  // ギルドコンテキストの確認
  if (!interaction.guild) {
    throw new Error("Guild not found");
  }

  // 応答を遅延させる（処理時間がかかるため）
  await interaction.deferReply();

  // 認証処理をUsecaseに委譲
  const result = await authenticateUser(
    interaction.user.id,
    interaction.guild.id,
  );

  // 結果をユーザーに返却
  await interaction.editReply(result.message);
}

export default authCommand;
