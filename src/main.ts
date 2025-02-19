import dotenv from "dotenv";
import registry from "./application/commands";
import { setupEventHandlers } from "./application/events/eventHandler";
import { scheduleHotChannels } from "./application/tasks/scheduleHotChannels";
import type AuthData from "./domain/types/authData";
import { CustomClient } from "./domain/types/customClient";
import logger from "./infrastructure/logger";

dotenv.config();

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
  scheduleHotChannels(client, hotChannelId, postHotChannelTime);

  await client.login(token);
  logger.info("Bot is running...");
}

main().catch((error) => {
  logger.error("Error in main: %o", error);
});
