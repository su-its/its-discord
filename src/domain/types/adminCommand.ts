import type { CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Command from "./command";

/**
 * Discord Slash Command の実装に必要な基本インターフェース
 * このインターフェースは、従来の Command と CommandWithArgs の両方の役割を統合したものです。
 * 管理者専用コマンドの場合は、このインターフェースを実装してください。
 *
 * @example
 * ```typescript
 * const killCommand: AdminCommand = {
 *   data: new SlashCommandBuilder()
 *     .setName('kill')
 *     .setDescription('プロセスを終了します'),
 *   execute: async (interaction: CommandInteraction) => {
 *     await interaction.reply('プロセスを終了しました');
 *   },
 * };
 * ```
 */
export default interface AdminCommand extends Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
  authorization: AuthorizationSpecification;
}

export interface AuthorizationSpecification {
  isSatisfiedBy: (interaction: CommandInteraction) => Promise<boolean>;
}
