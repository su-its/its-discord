import { Client, GatewayIntentBits } from "discord.js";
import type Role from "../domain/types/role";
import roleRegistry from "../domain/types/roles";
import logger from "../infrastructure/logger";

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

  await client.login(token);

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    // キャッシュにない場合は fetch
    await client.guilds.fetch(guildId);
  }
  const resolvedGuild = client.guilds.cache.get(guildId);
  if (!resolvedGuild) {
    throw new Error(`Guild not found: ${guildId}`);
  }

  const discordRoles = await resolvedGuild.roles.fetch();
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
        await legacyRole.edit({
          name: role.name,
          color: role.color,
          reason: `Migrated from "${legacyRole.name}"`,
        });
        logger.info(`Renamed role "${legacyRole.name}" → "${role.name}"`);
        renamed++;
        continue;
      }
    }

    // どちらもなければ新規作成
    await resolvedGuild.roles.create({
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

  client.destroy();
}
