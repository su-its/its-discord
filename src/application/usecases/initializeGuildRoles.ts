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
 * すべてのギルドでロール初期化を実行するUsecase
 */
export async function initializeAllGuildsRoles(): Promise<void> {
  try {
    const guild = await discordServerService.getFirstGuild();
    await initializeGuildRoles(guild.id);
  } catch (error) {
    logger.error("Failed to initialize guild roles:", error);
    throw error;
  }
}
