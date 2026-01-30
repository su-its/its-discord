import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import { itsCoreService } from "../../../../application/services/itsCoreService";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const whoCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("who")
    .setDescription("ユーザー情報を表示します。")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("情報を表示するユーザー")
        .setRequired(true),
    ) as SlashCommandBuilder,
  authorization: new AdminRoleSpecification(),
  execute: whoCommandHandler,
  isDMAllowed: false,
};

async function whoCommandHandler(interaction: ChatInputCommandInteraction) {
  const userOption = interaction.options.get("user");
  if (!userOption || !userOption.user) {
    await interaction.reply("ユーザーを指定してください。");
    return;
  }

  const user: User = userOption.user;
  const member = await itsCoreService.getMemberByDiscordId(user.id);
  if (!member) {
    await interaction.reply("メンバー情報が見つかりませんでした。");
    return;
  }

  await interaction.reply(
    `名前: ${member.name}\n学部: ${member.department}\n学籍番号: ${member.student_number}\nメールアドレス: ${member.mail}`,
  );
}

export default whoCommand;
