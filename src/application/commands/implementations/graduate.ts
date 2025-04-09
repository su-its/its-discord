import { CommandInteraction, SlashCommandBuilder, User, GuildMember, Role } from "discord.js";
import Command from "../../../domain/types/command";
import { getMemberByDiscordIdController, updateMemberController } from "../../controllers/MemberController";
import { DepartmentRoleCategory } from "../../roles/implementations/categories/departments/departmentRoleCategory";
import graduateRole from "../../roles/implementations/categories/departments/implementations/graduate";
import Department from "../../../domain/entities/department";

const graduateCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("graduate")
		.setDescription("卒業したメンバーのロールを変更します")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("卒業したメンバー")
				.setRequired(true),
		) as SlashCommandBuilder,
	execute: graduateCommandHandler,
}

async function graduateCommandHandler(interaction: CommandInteraction) {
	if (!interaction.guild) {
		await interaction.reply("このコマンドはサーバー内でのみ使用可能です");
		return;
	}

	const user = getTargetUser(interaction);
	if (!user) {
		await interaction.reply("ユーザーを指定してください");
		return;
	}

	const member = await fetchGuildMember(interaction, user.id);
	if (!member) {
		await interaction.reply("指定されたメンバーが取得できませんでした");
		return;
	}

	const memberData = await getMemberByDiscordIdController(user.id);
	if (!memberData) {
		await interaction.reply("指定されたメンバーのデータが取得できませんでした");
		return;
	}

	const departmentRole = findDepartmentRole(member);
	if (!departmentRole) {
		await interaction.reply("指定されたメンバーは学部ロールを持っていません");
		return;
	}

	const graduateRoleInGuild = findGraduateRole(interaction);
	if (!graduateRoleInGuild) {
		await interaction.reply("卒業ロールが見つかりませんでした");
		return;
	}

	await updateMemberRoles(member, departmentRole, graduateRoleInGuild);
	await updateMemberData(memberData.id);

	await interaction.reply(`${user.username}さんのロールを卒業ロールに変更しました`);
}

function getTargetUser(interaction: CommandInteraction): User | null {
	const userOption = interaction.options.get("user");
	return userOption?.user || null;
}

async function fetchGuildMember(interaction: CommandInteraction, userId: string): Promise<GuildMember | null> {
	try {
		return await interaction.guild!.members.fetch(userId);
	} catch {
		return null;
	}
}

function findDepartmentRole(member: GuildMember): Role | undefined {
	return member.roles.cache.find((role) =>
		role.name.startsWith(DepartmentRoleCategory.prefix)
	);
}

function findGraduateRole(interaction: CommandInteraction): Role | undefined {
	return interaction.guild!.roles.cache.find((role) =>
		role.name === graduateRole.name
	);
}

async function updateMemberRoles(member: GuildMember, departmentRole: Role, graduateRoleInGuild: Role): Promise<void> {
	await member.roles.remove(departmentRole);
	await member.roles.add(graduateRoleInGuild);
}

async function updateMemberData(memberId: string): Promise<void> {
	await updateMemberController({
		id: memberId,
		department: Department.GRADUATE
	});
}

export default graduateCommand;