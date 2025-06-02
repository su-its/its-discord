import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { updateMemberNickname } from "../../../../application/usecases/updateMemberNickname";
import type Command from "../../../../domain/types/command";

const nickCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("自分のニックネームを変更します")
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("新しいニックネーム")
        .setRequired(true),
    ) as SlashCommandBuilder,
  execute: nickCommandHandler,
  isDMAllowed: false,
};

async function nickCommandHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバー内でのみ使用できます。");
    return;
  }

  const nickname = interaction.options.get("nickname")?.value as string;
  if (!nickname || nickname.trim().length === 0) {
    await interaction.reply("ニックネームを指定してください。");
    return;
  }

  // ニックネームの長さ制限（Discordの制限に合わせる）
  if (nickname.length > 32) {
    await interaction.reply("ニックネームは32文字以下である必要があります。");
    return;
  }

  // 処理が長くなる可能性があるので遅延応答
  await interaction.deferReply();

  try {
    const result = await updateMemberNickname(
      interaction.user.id,
      interaction.guild.id,
      nickname.trim(),
    );

    await interaction.followUp(result.message);
  } catch (error) {
    await interaction.followUp(
      "ニックネームの変更中にエラーが発生しました。後でもう一度お試しください。",
    );
  }
}

export default nickCommand;
