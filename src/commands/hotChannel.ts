import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types/command";
import { generateChannelActivityRanking } from "../usecases/getHotChannels";
import checkIsAdmin from "../utils/checkMemberRole";

const hotChannelsCommand: Command = {
  data: new SlashCommandBuilder().setName("hot_channels").setDescription("Show hot channels ranking"),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) return await interaction.reply("このコマンドはサーバーでのみ実行可能です");
    const isAdmin: boolean = await checkIsAdmin(interaction);
    if (!isAdmin) return await interaction.reply("このコマンドは管理者のみ使用可能です");
    const ranking = await generateChannelActivityRanking(interaction.guild!);
    await interaction.reply({ embeds: [ranking] });
  },
};

export default hotChannelsCommand;
