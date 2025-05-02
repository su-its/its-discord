import type { CommandInteraction } from "discord.js";
import type Command from "../../../domain/types/command";
import type AdminCommand from "../../../domain/types/adminCommand";
import checkIsAdmin from "../../utils/checkMemberRole";

/**
 * 管理者コマンドの実行前に認可チェックを行うデコレーター
 * @param command 管理者コマンド
 * @returns 認可チェック付きのコマンド
 */
export function withAdminCheck(command: AdminCommand): Command {
  return {
    data: command.data,
    execute: async (interaction: CommandInteraction) => {
      const isAdmin = await checkIsAdmin(interaction);
      if (!isAdmin) {
        await interaction.reply("このコマンドは管理者のみ使用可能です。");
        return;
      }
      await command.execute(interaction);
    },
  };
}
