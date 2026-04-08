import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import logger from "@infrastructure/logger";
import { deployCommands, loadDeployEnv } from "./deployCommands";

async function main() {
  const { token, clientId, guildId } = loadDeployEnv();
  await deployCommands(token, clientId, guildId);
}

main().catch((error) =>
  logger.error("Failed to execute main function:", error),
);
