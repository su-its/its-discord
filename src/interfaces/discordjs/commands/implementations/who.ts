import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import type { AppDeps } from "../../../../application/ports/deps";
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

async function whoCommandHandler(
  interaction: ChatInputCommandInteraction,
  deps: AppDeps,
) {
  const userOption = interaction.options.get("user");
  if (!userOption?.user) {
    await interaction.reply("ユーザーを指定してください。");
    return;
  }

  const user: User = userOption.user;
  const member = await deps.itsCorePort.getMemberByDiscordId(user.id);
  if (!member) {
    await interaction.reply("メンバー情報が見つかりませんでした。");
    return;
  }

  const lines = [`名前: ${member.name}`, `ステータス: ${member.status}`];
  if (member.status === "active") {
    lines.push(`所属: ${member.affiliation}`);
    lines.push(`学籍番号: ${member.studentId}`);
  }
  lines.push(`メールアドレス: ${member.universityEmail}`);

  await interaction.reply(lines.join("\n"));
}

export default whoCommand;
