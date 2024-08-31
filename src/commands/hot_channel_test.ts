import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types/command";
import { getHotChannels } from "../usecases/getHotChannels";
import checkIsAdmin from "../utils/checkMemberRole";

const hotChannelsCommand: Command = {
  data: new SlashCommandBuilder().setName("hot_channels").setDescription("Show hot channels ranking"),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) return await interaction.reply("このコマンドはサーバーでのみ実行可能です");
    const isAdmin: boolean = await checkIsAdmin(interaction);
    if (!isAdmin) return await interaction.reply("このコマンドは管理者のみ使用可能です");
    const ranking = await getHotChannels(interaction.guild!);
    await interaction.reply(ranking);
  },
};

export default hotChannelsCommand;
