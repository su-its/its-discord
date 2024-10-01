import type { CommandInteraction, SlashCommandBuilder } from "discord.js";

type OmittedSlashCommandBuilder = Omit<
	SlashCommandBuilder,
	"addSubcommand" | "addSubcommandGroup"
>;

interface CommandWithArgs {
	data: OmittedSlashCommandBuilder;
	execute: (interaction: CommandInteraction) => void;
}

export default CommandWithArgs;
