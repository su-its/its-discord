import dotenv from "dotenv";

dotenv.config();

import logger from "@infrastructure/logger";
import { loadMigrateEnv, migrateRoles } from "./migrateRoles";

async function main() {
  const { token, guildId } = loadMigrateEnv();
  await migrateRoles(token, guildId);
}

main().catch((error) =>
  logger.error("Failed to execute role migration:", error),
);
