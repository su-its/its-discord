import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { generateChannelActivityRanking } from "../../../../application/usecases/getHotChannels";
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
  const ranking = await generateChannelActivityRanking(interaction.guild.id);
  await interaction.reply({ embeds: [ranking] });
}

export default hotChannelsCommand;
