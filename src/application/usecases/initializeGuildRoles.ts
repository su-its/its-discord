import roleRegistry from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";

/**
 * 指定されたギルドのロールを初期化するUsecase
 * RoleRegistryに登録されたすべてのロールを作成・確認する
 */
export async function initializeGuildRoles(guildId: string): Promise<void> {
  const roles = roleRegistry.getAllRoles();
  logger.info(`Found ${roles.length} roles for guild ${guildId}`);

  // すべてのロールを並列で初期化
  await Promise.all(
    roles.map(async (role) => {
      try {
        await discordServerService.ensureRoleExists(guildId, role);
        logger.debug(`Role ${role.name} ensured for guild ${guildId}`);
      } catch (error) {
        logger.error(`Failed to ensure role ${role.name}:`, error);
        throw error;
      }
    }),
  );

  logger.info(`Role initialization completed for guild ${guildId}`);
}

/**
 * 設定された GUILD_ID に対してロール初期化を実行するUsecase
 * TODO: getFirstGuild() を使用している他の箇所（postHotChannels, scheduledMessages）も GUILD_ID ベースに変更する #160
 */
export async function initializeAllGuildsRoles(guildId: string): Promise<void> {
  try {
    await initializeGuildRoles(guildId);
  } catch (error) {
    logger.error("Failed to initialize guild roles:", error);
    throw error;
  }
}
