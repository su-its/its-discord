import { createMemberUseCases } from "@shizuoka-its/core";
import {
  type CommandInteraction,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import type Command from "../../../../domain/types/command";
import { toInternalMember } from "../../../../infrastructure/itscore/mapper";

const memberUsecase = createMemberUseCases();

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
  isDMAllowed: false,
};

async function whoCommandHandler(interaction: CommandInteraction) {
  const userOption = interaction.options.get("user");
  if (!userOption || !userOption.user) {
    await interaction.reply("ユーザーを指定してください。");
    return;
  }

  const user: User = userOption.user;
  memberUsecase.getMemberByDiscordId
    .execute({
      discordId: user.id,
    })
    .then((member) => {
      if (!member) {
        return interaction.reply("メンバー情報が見つかりませんでした。");
      }
      const internalMember = toInternalMember(member);
      return interaction.reply(
        `名前: ${internalMember.name}\n学部: ${internalMember.department}\n学籍番号: ${internalMember.student_number}\nメールアドレス: ${internalMember.mail}`,
      );
    });
}

export default whoCommand;
