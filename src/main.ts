import type AuthData from "./domain/types/authData";
import { CustomClient } from "./domain/types/customClient";
import logger from "./infrastructure/logger";
// DIコンテナの初期化（アプリケーション起動時に実行される）
import "./infrastructure/di/container";
import { loadConfig, validateConfig } from "./config";
import { setupDependencyInjection } from "./infrastructure/di/container";
import { scheduleHotChannelsCron } from "./interfaces/cron/hotChannelsCron";
import { initializeScheduledMessageCron } from "./interfaces/cron/scheduledMessageCron";
import { initializeScheduledMessagesFromConfig } from "./application/usecases/initializeScheduledMessagesFromConfig";
import registry from "./interfaces/discordjs/commands";
import { setupEventHandlers } from "./interfaces/discordjs/events/eventHandler";

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const client = new CustomClient();
const userStates = new Map<string, AuthData>();

async function main() {
  try {
    // アプリケーション設定を読み込み・検証
    const config = loadConfig();
    validateConfig(config);
    logger.info("Configuration loaded and validated successfully");

    // Registry からすべてのコマンドを取得し、クライアントに登録
    const commands = registry.getAllCommands();
    for (const command of commands) {
      client.commands.set(command.data.name, command);
      logger.debug(`Loaded command: ${command.data.name}`);
    }

    // イベントハンドラを設定
    setupEventHandlers(client, userStates);

    // クライアントをログイン
    await client.login(config.discordToken);

    // クライアント初期化後にDiscordServerAdapterを設定
    setupDependencyInjection(client);

    // ホットチャンネルのクロンを設定（DIコンテナ初期化後）
    scheduleHotChannelsCron(config.hotChannelId, config.postHotChannelTime);

    // スケジュールメッセージシステムを初期化（DIコンテナ初期化後）
    await initializeScheduledMessageCron();

    // 設定ファイルからスケジュールメッセージを初期化
    await initializeScheduledMessagesFromConfig();

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
