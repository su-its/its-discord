import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";
import { getMemberByDiscordId } from "../controllers/MemberController";

const who: Command = {
  data: new SlashCommandBuilder()
    .setName("who")
    .setDescription("ユーザー情報を表示します。")
    .addUserOption((option) => option.setName("user").setDescription("情報を表示するユーザー").setRequired(true)),

  execute: whoHandler,
};

async function whoHandler(interaction: CommandInteraction) {
  if (!interaction.guild) return await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");

  // メンションされたユーザーの情報を取得
  const user = interaction.options.getUser("user");
  if (!user) return await interaction.reply("ユーザーを指定してください。");

  const member = await getMemberByDiscordId(user.id);
  if (!member) return await interaction.reply("メンバー情報が見つかりませんでした。");

  await interaction.reply(
    `名前: ${member.name}\n学部: ${member.department}\n学籍番号: ${member.student_number}\nメールアドレス: ${member.mail}`
  );
}

export default who;
