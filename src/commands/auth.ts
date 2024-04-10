import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types/command";

const authCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('認証コマンド'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('認証しました！');
    }
};

export default authCommand;