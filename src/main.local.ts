import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import type { AppDeps } from "./application/ports/deps";
import type { EmailAuthPort } from "./application/ports/emailAuthPort";
import type { ITSCorePort } from "./application/ports/itsCorePort";
import { initializeScheduledMessagesFromConfig } from "./application/usecases/initializeScheduledMessagesFromConfig";
import type { AdapterConfig } from "./config/environment";
import { loadConfig } from "./config/environment";
import { CustomClient } from "./domain/types/customClient";
import { DiscordServerAdapter } from "./infrastructure/discordjs/discordServerAdapter";
import { FirebaseEmailAuthAdapter } from "./infrastructure/firebase/firebaseEmailAuthAdapter";
import { InMemoryEmailAuthAdapter } from "./infrastructure/in-memory/inMemoryEmailAuthAdapter";
import { InMemoryITSCoreAdapter } from "./infrastructure/in-memory/inMemoryITSCoreAdapter";
import { ITSCoreAdaptor } from "./infrastructure/itscore/itsCoreAdaptor";
import logger from "./infrastructure/logger";
import { memoryScheduledMessageRepository } from "./infrastructure/memory/scheduledMessageRepository";
import { scheduledMessageCronManager } from "./interfaces/cron/scheduledMessageCron";
import registry from "./interfaces/discordjs/commands";
import { setupEventHandlers } from "./interfaces/discordjs/events/eventHandler";

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const client = new CustomClient();

function createITSCorePort(adapterType: AdapterConfig["itsCore"]): ITSCorePort {
  if (adapterType === "in-memory") {
    logger.info("ITSCore: in-memory adapter");
    return new InMemoryITSCoreAdapter();
  }
  logger.info("ITSCore: production adapter");
  return new ITSCoreAdaptor();
}

function createEmailAuthPort(
  adapterType: AdapterConfig["emailAuth"],
): EmailAuthPort {
  if (adapterType === "in-memory") {
    logger.info("EmailAuth: in-memory adapter");
    return new InMemoryEmailAuthAdapter();
  }
  logger.info("EmailAuth: firebase adapter");
  return new FirebaseEmailAuthAdapter();
}

async function main() {
  try {
    const config = loadConfig();
    logger.info(
      `Configuration loaded (environment: ${config.environment}, adapters: itsCore=${config.adapters.itsCore}, emailAuth=${config.adapters.emailAuth})`,
    );

    const commands = registry.getAllCommands();
    for (const command of commands) {
      client.commands.set(command.data.name, command);
      logger.debug(`Loaded command: ${command.data.name}`);
    }

    // Composition Root: adapter を生成し依存オブジェクトを組み立てる
    const discordServerAdapter = new DiscordServerAdapter(client);
    const deps: AppDeps = {
      itsCorePort: createITSCorePort(config.adapters.itsCore),
      emailAuthPort: createEmailAuthPort(config.adapters.emailAuth),
      discordMemberPort: discordServerAdapter,
      discordChannelPort: discordServerAdapter,
      discordGuildPort: discordServerAdapter,
      discordMessagePort: discordServerAdapter,
      scheduledMessagePort: memoryScheduledMessageRepository,
    };

    scheduledMessageCronManager.setDeps(deps);

    // イベントハンドラを設定（ClientReady を捕捉するため login の前に登録する）
    setupEventHandlers(client, config.guildId, deps);

    await client.login(config.discordToken);

    await initializeScheduledMessagesFromConfig(deps);

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
