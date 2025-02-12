import {
  type CommandInteraction,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import type Command from "../../../domain/types/command";
import logger from "../../../infrastructure/logger";
import { getMemberByDiscordIdController } from "../../controllers/MemberController";

const whoCommand: Command = {
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
  const member = await getMemberByDiscordIdController(user.id);

  if (!member) {
    await interaction.reply("メンバー情報が見つかりませんでした。");
    return;
  }

  await interaction.reply(
    `名前: ${member.name}\n学部: ${member.department}\n学籍番号: ${member.student_number}\nメールアドレス: ${member.mail}`,
  );
}

function printLog(interaction: CommandInteraction) {
  logger.info(`[COMMAND] who command terminated by ${interaction.user}`);
}

export default whoCommand;
