import dotenv from "dotenv";
import type AuthData from "./domain/types/authData";
import { CustomClient } from "./domain/types/customClient";
import logger from "./infrastructure/logger";
// DIコンテナの初期化（アプリケーション起動時に実行される）
import "./infrastructure/di/container";
import { setupDependencyInjection } from "./infrastructure/di/container";
import { scheduleHotChannelsCron } from "./interfaces/cron/hotChannelsCron";
import registry from "./interfaces/discordjs/commands";
import { setupEventHandlers } from "./interfaces/discordjs/events/eventHandler";

dotenv.config();

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const client = new CustomClient();
const token = process.env.TOKEN;
const userStates = new Map<string, AuthData>();
const hotChannelId = process.env.HOT_CHANNEL_ID;
const postHotChannelTime = process.env.POST_HOT_CHANNEL_TIME;

async function main() {
  if (!token || !hotChannelId || !postHotChannelTime) {
    logger.error("Missing environment variables.");
    process.exit(1);
  }
  // Registry からすべてのコマンドを取得し、クライアントに登録
  const commands = registry.getAllCommands();
  for (const command of commands) {
    client.commands.set(command.data.name, command);
    logger.debug(`Loaded command: ${command.data.name}`);
  }

  setupEventHandlers(client, userStates);
  scheduleHotChannelsCron(client, hotChannelId, postHotChannelTime);

  await client.login(token);

  // クライアント初期化後にDiscordServerAdapterを設定
  setupDependencyInjection(client);

  logger.info("Bot is running...");
}

main().catch((error) => {
  logger.error("Error in main function during startup:", error);
});
