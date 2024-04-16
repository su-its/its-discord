import { SlashCommandBuilder, CommandInteraction, AllowedMentionsTypes } from "discord.js";
import { Command } from "../types/command";
import { adminAuth } from "../infra/firebase";

const authCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('認証コマンド'),
    async execute(interaction: CommandInteraction) {
        // await adminAuth.getUserByEmail();
        await interaction.reply('認証しました！');
    }
};

export default authCommand;