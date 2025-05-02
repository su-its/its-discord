import { Events } from "discord.js";
import type { Guild } from "discord.js";
import type { CustomClient } from "../../../domain/types/customClient";
import logger from "../../../infrastructure/logger";
import roleRegistry from "../../../application/roles";
import createRoleIfNotFound from "../../../application/utils/createRoleNotFound";

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

    // 各ギルドでロール初期化を実施
    for (const guild of guilds.values()) {
      logger.info(`Initializing roles for guild ${guild.name} (${guild.id})`);
      await initializeRoles(guild);
    }
  });
}

/**
 * 指定されたギルドに対して、RoleRegistry に登録された全ロールを初期化する。
 * 各ロールが存在しない場合は作成を試み、成功・失敗をそれぞれログ出力する。
 *
 * @param guild 初期化対象の Discord ギルド
 */
async function initializeRoles(guild: Guild): Promise<void> {
  const roles = roleRegistry.getAllRoles();
  logger.info(`Found ${roles.length} roles for guild ${guild.name} (${guild.id})`);

  await Promise.all(
    roles.map(async (role) => {
      await createRoleIfNotFound({ guild, role });
    })
  );
}
