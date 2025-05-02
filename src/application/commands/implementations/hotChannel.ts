import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type AdminCommand from "../../../domain/types/adminCommand";
import { generateChannelActivityRanking } from "../../usecases/getHotChannels";
import { AdminRoleSpecification } from "../../../infrastructure/authorization/adminRoleSpecification";

const hotChannelsCommand: AdminCommand = {
  data: new SlashCommandBuilder().setName("hot_channels").setDescription("Show hot channels ranking"),
  execute: hotChannelsHandler,
  authorization: new AdminRoleSpecification(),
};

async function hotChannelsHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバーでのみ実行可能です");
    return;
  }

  const ranking = await generateChannelActivityRanking(interaction.guild);
  await interaction.reply({ embeds: [ranking] });
}

export default hotChannelsCommand;
