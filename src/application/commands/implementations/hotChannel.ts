import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "../../../domain/types/command";
import { generateChannelActivityRanking } from "../../usecases/getHotChannels";
import checkIsAdmin from "../../utils/checkMemberRole";

const hotChannelsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("hot_channels")
    .setDescription("Show hot channels ranking"),
  execute: hotChannelsHandler,
};

async function hotChannelsHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("このコマンドはサーバーでのみ実行可能です");
    return;
  }

  const isAdmin: boolean = await checkIsAdmin(interaction);
  if (!isAdmin) {
    await interaction.reply("このコマンドは管理者のみ使用可能です");
    return;
  }

  const ranking = await generateChannelActivityRanking(interaction.guild);
  await interaction.reply({ embeds: [ranking] });
}

export default hotChannelsCommand;
