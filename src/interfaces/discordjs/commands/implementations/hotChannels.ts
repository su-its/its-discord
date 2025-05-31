import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { postHotChannels } from "../../../../application/usecases/postHotChannels";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const hotChannelsCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("hot_channels")
    .setDescription("Show hot channels ranking"),
  execute: hotChannelsHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function hotChannelsHandler(interaction: CommandInteraction) {
  if (!interaction.guild) throw new Error("Guild not found");

  // postHotChannels Usecaseを使用してチャンネルにランキングを投稿
  // interaction.channelIdを使用して現在のチャンネルに送信
  if (!interaction.channelId) throw new Error("Channel ID not found");

  await postHotChannels(interaction.channelId);
  await interaction.reply({
    content: "ホットチャンネルランキングを投稿しました！",
    ephemeral: true,
  });
}

export default hotChannelsCommand;
