import { Events } from "discord.js";
import { initializeAllGuildsRoles } from "../../../application/usecases/initializeGuildRoles";
import type { CustomClient } from "../../../domain/types/customClient";
import logger from "../../../infrastructure/logger";

/**
 * ClientReady イベント発生時のハンドラを設定する。
 * クライアントのログイン状態を確認し、各ギルドに対してロール初期化処理を実施する。
 */
export function setupClientReadyHandler(client: CustomClient): void {
  client.once(Events.ClientReady, async () => {
    logger.info("Client ready");

    if (!client.user) {
      logger.error("Client user is undefined");
      throw new Error("Client user is undefined");
    }
    logger.info(`Logged in as ${client.user.tag}`);

    const guilds = client.guilds.cache;
    if (guilds.size === 0) {
      logger.error("No guild found");
      throw new Error("No guild found");
    }

    // ロール初期化を実施
    try {
      await initializeAllGuildsRoles();
      logger.info("Guild roles initialization completed");
    } catch (error) {
      logger.error("Failed to initialize guild roles:", error);
      throw error;
    }
  });
}
