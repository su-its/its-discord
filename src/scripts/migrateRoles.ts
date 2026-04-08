import type Role from "@domain/types/role";
import roleRegistry from "@domain/types/roles";
import logger from "@infrastructure/logger";
import { Client, Events, GatewayIntentBits } from "discord.js";

export function loadMigrateEnv() {
  const token = process.env.TOKEN;
  const guildId = process.env.GUILD_ID;

  if (!token || !guildId) {
    logger.error("Missing environment variables: TOKEN, GUILD_ID");
    process.exit(1);
  }
  return { token, guildId };
}

export async function migrateRoles(
  token: string,
  guildId: string,
): Promise<void> {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  try {
    await client.login(token);

    // ready イベントを待ってキャッシュが確実に利用可能になるようにする
    await new Promise<void>((resolve) => {
      if (client.isReady()) {
        resolve();
      } else {
        client.once(Events.ClientReady, () => resolve());
      }
    });

    const guild =
      client.guilds.cache.get(guildId) ?? (await client.guilds.fetch(guildId));
    if (!guild) {
      throw new Error(`Guild not found: ${guildId}`);
    }

    const discordRoles = await guild.roles.fetch();
    const allRoles: Role[] = roleRegistry.getAllRoles();

    let renamed = 0;
    let skipped = 0;
    let created = 0;

    for (const role of allRoles) {
      // 現在の名前で既に存在する場合はスキップ
      const existing = discordRoles.find((r) => r.name === role.name);
      if (existing) {
        logger.debug(`Role "${role.name}" already exists, skipping`);
        skipped++;
        continue;
      }

      // 旧名で検索してリネーム
      if (role.previousNames) {
        const legacyRole = discordRoles.find((r) =>
          role.previousNames?.includes(r.name),
        );
        if (legacyRole) {
          const oldName = legacyRole.name;
          await legacyRole.edit({
            name: role.name,
            color: role.color,
            reason: `Migrated from "${oldName}"`,
          });
          logger.info(`Renamed role "${oldName}" → "${role.name}"`);
          renamed++;
          continue;
        }
      }

      // どちらもなければ新規作成
      await guild.roles.create({
        name: role.name,
        color: role.color,
        reason: role.reason,
      });
      logger.info(`Created new role "${role.name}"`);
      created++;
    }

    logger.info(
      `Migration complete: ${renamed} renamed, ${created} created, ${skipped} skipped`,
    );
  } finally {
    client.destroy();
  }
}
