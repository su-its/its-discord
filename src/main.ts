import type { AppDeps } from "./application/ports/deps";
import { initializeScheduledMessagesFromConfig } from "./application/usecases/initializeScheduledMessagesFromConfig";
import { loadConfig } from "./config/environment";
import { CustomClient } from "./domain/types/customClient";
import { DiscordServerAdapter } from "./infrastructure/discordjs/discordServerAdapter";
import { FirebaseEmailAuthAdapter } from "./infrastructure/firebase/firebaseEmailAuthAdapter";
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

async function main() {
  try {
    // アプリケーション設定を読み込み・検証
    const config = loadConfig();
    logger.info("Configuration loaded and validated successfully");

    // Registry からすべてのコマンドを取得し、クライアントに登録
    const commands = registry.getAllCommands();
    for (const command of commands) {
      client.commands.set(command.data.name, command);
      logger.debug(`Loaded command: ${command.data.name}`);
    }

    // Composition Root: adapter を生成し依存オブジェクトを組み立てる
    const discordServerAdapter = new DiscordServerAdapter(client);
    const deps: AppDeps = {
      itsCorePort: new ITSCoreAdaptor(),
      emailAuthPort: new FirebaseEmailAuthAdapter(),
      discordMemberPort: discordServerAdapter,
      discordChannelPort: discordServerAdapter,
      discordGuildPort: discordServerAdapter,
      discordMessagePort: discordServerAdapter,
      scheduledMessagePort: memoryScheduledMessageRepository,
      cronSchedulerPort: scheduledMessageCronManager,
    };

    scheduledMessageCronManager.setDeps(deps);

    // イベントハンドラを設定（ClientReady を捕捉するため login の前に登録する）
    setupEventHandlers(client, config.guildId, deps);

    // クライアントをログイン
    await client.login(config.discordToken);

    // 設定ファイルからスケジュールメッセージを初期化
    await initializeScheduledMessagesFromConfig(deps);

    logger.info("Bot is running...");
  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Error in main function during startup:", error);
  process.exit(1);
});
