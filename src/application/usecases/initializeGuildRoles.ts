import roleRegistry from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import type { AppDeps } from "../ports/deps";

/**
 * 指定されたギルドのロールを初期化するUsecase
 * RoleRegistryに登録されたすべてのロールを作成・確認する
 */
export async function initializeGuildRoles(
  guildId: string,
  deps: Pick<AppDeps, "discordGuildPort">,
): Promise<void> {
  const roles = roleRegistry.getAllRoles();
  logger.info(`Found ${roles.length} roles for guild ${guildId}`);

  // すべてのロールを並列で初期化
  await Promise.all(
    roles.map(async (role) => {
      try {
        await deps.discordGuildPort.ensureRoleExists(guildId, role);
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
 */
export async function initializeAllGuildsRoles(
  guildId: string,
  deps: Pick<AppDeps, "discordGuildPort">,
): Promise<void> {
  try {
    await initializeGuildRoles(guildId, deps);
  } catch (error) {
    logger.error("Failed to initialize guild roles:", error);
    throw error;
  }
}
