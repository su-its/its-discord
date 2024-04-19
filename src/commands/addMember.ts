import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandWithArgs from "../types/commandWithArgs";

const addMemberCommand: CommandWithArgs = {
    data: new SlashCommandBuilder()
        .setName("add_member")
        .setDescription("認証コマンド")
        .addStringOption(option =>
            option.setName("mail")
                .setDescription("メールアドレス")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("name")
                .setDescription("名前")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("department")
                .setDescription("学部")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("student_number")
                .setDescription("学籍番号")
                .setRequired(true)),
    execute: addMemberCommandHandler,
};

async function addMemberCommandHandler(interaction: CommandInteraction) {
    await interaction.reply(`name: ${interaction.options.get("name")?.value}`);
}

export default addMemberCommand;