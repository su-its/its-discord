import { CommandInteraction, InteractionCollector, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";
import checkIsAdmin from "../utils/checkMemberRole";
import { getMemberByDiscordId } from "../controllers/MemberController";

const renameALL: Command = {
    data: new SlashCommandBuilder(),
    execute: renameALLHandler,
};

async function renameALLHandler(interaction: CommandInteraction) {
    if (!interaction.guild) return await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");

    const isAdmin = await checkIsAdmin(interaction);
    if (!isAdmin) return await interaction.reply("このコマンドは管理者のみ使用可能です。");

    const members = await interaction.guild.members.fetch();
    for (const [, member] of members) {
        const memberOnFirebase = await getMemberByDiscordId(member.id);
        if (!memberOnFirebase) continue;
        await member.setNickname(memberOnFirebase!.name);
    }
}

export default renameALL;