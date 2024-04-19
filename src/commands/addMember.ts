import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandWithArgs from "../types/commandWithArgs";
import Member from "../entities/member";
import { administratorRoleProperty } from "../roles/administrator";

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
    //DMでは使用不可
    if (!interaction.guild) return await interaction.reply('このコマンドはサーバー内でのみ使用可能です。');

    //adminロールを持っているか確認
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isAdmin: boolean = member.roles.cache.some(role => role.name === administratorRoleProperty.roleName);
    if (!isAdmin) return await interaction.reply('このコマンドは管理者のみ使用可能です。');

    await interaction.reply(`name: ${interaction.options.get("name")?.value}`);
}

export default addMemberCommand;