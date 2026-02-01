import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Discord Slash Command の実装に必要な基本インターフェース
 * このインターフェースは、従来の Command と CommandWithArgs の両方の役割を統合したものです。
 *
 * @example
 * ```typescript
 * const pingCommand: Command = {
 *   data: new SlashCommandBuilder()
 *     .setName('ping')
 *     .setDescription('Replies with Pong!'),
 *   execute: async (interaction: ChatInputCommandInteraction) => {
 *     await interaction.reply('Pong!');
 *   },
 * };
 * ```
 */
export default interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  isDMAllowed: boolean;
}
