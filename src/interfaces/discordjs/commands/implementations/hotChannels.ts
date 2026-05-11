import type { AppDeps } from "@application/ports";
import { postHotChannels } from "@application/usecases";
import type AdminCommand from "@domain/types/adminCommand";
import { AdminRoleSpecification } from "@infrastructure/authorization";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const hotChannelsCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("hot_channels")
    .setDescription("Show hot channels ranking"),
  execute: hotChannelsHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function hotChannelsHandler(
  interaction: ChatInputCommandInteraction,
  deps: AppDeps,
) {
  if (!interaction.guild) throw new Error("Guild not found");
  if (!interaction.channelId) throw new Error("Channel ID not found");

  await postHotChannels(interaction.channelId, interaction.guild.id, deps);
  await interaction.reply({
    content: "ホットチャンネルランキングを投稿しました！",
    ephemeral: true,
  });
}

export default hotChannelsCommand;
