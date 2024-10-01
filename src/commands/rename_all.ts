import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getMemberByDiscordId } from "../controllers/MemberController";
import type { Command } from "../types/command";
import checkIsAdmin from "../utils/checkMemberRole";

const renameALL: Command = {
	data: new SlashCommandBuilder()
		.setName("rename_all")
		.setDescription("全員のニックネームを変更する"),
	execute: renameALLHandler,
};

async function renameALLHandler(interaction: CommandInteraction) {
	if (!interaction.guild)
		return await interaction.reply(
			"このコマンドはサーバー内でのみ使用可能です。",
		);

	const isAdmin = await checkIsAdmin(interaction);
	if (!isAdmin)
		return await interaction.reply("このコマンドは管理者のみ使用可能です。");

	// 応答がタイムアウトしないように遅延させる
	await interaction.deferReply();

	const members = await interaction.guild.members.fetch();
	const renamePromises = members.map(async (member) => {
		const memberOnFirebase = await getMemberByDiscordId(member.id);
		if (!memberOnFirebase) return;

		try {
			await member.setNickname(memberOnFirebase.name);
			console.log(
				`[NOTE] Changed nickname of ${member.nickname}, ${memberOnFirebase.name}`,
			);
		} catch (error) {
			console.error(`[ERROR] Failed to rename ${member.nickname}: ${error}`);
		}
	});

	await Promise.all(renamePromises);
	await interaction.followUp("ニックネームの変更が完了しました。");
	console.log("[NOTE] Completed changing nicknames");
}

export default renameALL;
