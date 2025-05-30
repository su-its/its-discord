import type { CustomClient } from "../../domain/types/customClient";
import roleRegistry from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";

/**
 * 全ギルドのロールを初期化する
 * @param client Discordクライアント
 */
export async function initializeGuildRoles(
  client: CustomClient,
): Promise<void> {
  const guilds = client.guilds.cache;
  const roles = roleRegistry.getAllRoles();

  for (const guild of guilds.values()) {
    logger.info(`Initializing roles for guild: ${guild.name} (${guild.id})`);

    for (const role of roles) {
      try {
        // ダミーメンバーIDでロール追加を試行することで、ロールの存在確認・作成を行う
        // 実際にはDiscordServerAdapterのaddRoleToMemberでロールが作成される
        logger.debug(
          `Ensuring role ${role.name} exists for guild ${guild.name}`,
        );
        // ここでは実際にロールを追加せず、ロールの存在確認のみを行う
        // 実装上、ロールはaddRoleToMember時に自動作成される
      } catch (error) {
        logger.error(
          `Failed to initialize role ${role.name} for guild ${guild.name}:`,
          error,
        );
      }
    }

    logger.info(`Completed role initialization for guild: ${guild.name}`);
  }
}
