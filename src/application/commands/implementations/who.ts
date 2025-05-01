import { createMemberUseCases } from "@shizuoka-its/core";
import { type CommandInteraction, SlashCommandBuilder, type User } from "discord.js";
import type Command from "../../../domain/types/command";
import { toInternalMember } from "../../../infrastructure/itscore/mapper";

const memberUsecase = createMemberUseCases();

const whoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("who")
    .setDescription("ユーザー情報を表示します。")
    .addUserOption((option) =>
      option.setName("user").setDescription("情報を表示するユーザー").setRequired(true)
    ) as SlashCommandBuilder,
  execute: whoCommandHandler,
};

async function whoCommandHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
    return;
  }

  const userOption = interaction.options.get("user");
  if (!userOption || !userOption.user) {
    await interaction.reply("ユーザーを指定してください。");
    return;
  }

  const user: User = userOption.user;
  const member = await memberUsecase.getMemberByDiscordId.execute({
    discordId: user.id,
  });

  if (!member) {
    await interaction.reply("メンバー情報が見つかりませんでした。");
    return;
  }
  const internalMember = toInternalMember(member);

  await interaction.reply(
    `名前: ${internalMember.name}\n学部: ${internalMember.department}\n学籍番号: ${internalMember.student_number}\nメールアドレス: ${internalMember.mail}`
  );
}

export default whoCommand;
