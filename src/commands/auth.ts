import { SlashCommandBuilder, CommandInteraction } from "discord.js";

const command = {
    data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('認証コマンド'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('認証しました！');
    }
};

export default command;