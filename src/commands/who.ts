import {
  type CommandInteraction,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import { getMemberByDiscordId } from "../controllers/MemberController";
import type CommandWithArgs from "../types/commandWithArgs";

const whoCommand: CommandWithArgs = {
  data: new SlashCommandBuilder()
    .setName("who")
    .setDescription("ユーザー情報を表示します。")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("情報を表示するユーザー")
        .setRequired(true),
    ) as SlashCommandBuilder,
  execute: whoCommandHandler,
};

async function whoCommandHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
    return;
  }

  printLog(interaction);

  const userOption = interaction.options.get("user");
  if (!userOption || !userOption.user) {
    await interaction.reply("ユーザーを指定してください。");
    return;
  }

  const user: User = userOption.user;
  const member = await getMemberByDiscordId(user.id);

  if (!member) {
    await interaction.reply("メンバー情報が見つかりませんでした。");
    return;
  }

  await interaction.reply(
    `名前: ${member.name}\n学部: ${member.department}\n学籍番号: ${member.student_number}\nメールアドレス: ${member.mail}`,
  );
}

function printLog(interaction: CommandInteraction) {
  console.log(`[COMMAND] who command terminated by ${interaction.user}`);
}

export default whoCommand;
