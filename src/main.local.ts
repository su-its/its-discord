import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { initializeScheduledMessagesFromConfig } from "./application/usecases/initializeScheduledMessagesFromConfig";
import { loadConfig } from "./config/environment";
import { CustomClient } from "./domain/types/customClient";
import {
  setupDependencyInjection,
  setupDiscordServerAdapter,
} from "./infrastructure/di/container";
import logger from "./infrastructure/logger";
import registry from "./interfaces/discordjs/commands";
import { setupEventHandlers } from "./interfaces/discordjs/events/eventHandler";

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const client = new CustomClient();

async function main() {
  try {
    const config = loadConfig();
    logger.info(
      `Configuration loaded (environment: ${config.environment}, adapters: itsCore=${config.adapters.itsCore}, emailAuth=${config.adapters.emailAuth})`,
    );

    setupDependencyInjection(config.adapters);

    const commands = registry.getAllCommands();
    for (const command of commands) {
      client.commands.set(command.data.name, command);
      logger.debug(`Loaded command: ${command.data.name}`);
    }

    setupEventHandlers(client, config.guildId);

    await client.login(config.discordToken);

    setupDiscordServerAdapter(client);

    await initializeScheduledMessagesFromConfig();

    logger.info("Bot is running (local mode)...");
  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Error in main function during startup:", error);
  process.exit(1);
});
