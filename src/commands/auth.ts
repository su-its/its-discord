import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types/command";

//TODO: 中身を実装する
const authCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('認証コマンド'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('認証しました！');
    }
};

export default authCommand;