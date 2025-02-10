import dotenv from "dotenv";
import { setupEventHandlers } from "./application/events/eventHandler";
import { scheduleHotChannels } from "./application/tasks/scheduleHotChannels";
import type AuthData from "./domain/types/authData";
import { CustomClient } from "./domain/types/customClient";
import { loadCommands } from "./scripts/loadCommands";

dotenv.config();

const client = new CustomClient();
const token = process.env.TOKEN;
const userStates = new Map<string, AuthData>();
const horChannelId = process.env.HOT_CHANNEL_ID;
const postHotChannelTime = process.env.POST_HOT_CHANNEL_TIME;

async function main() {
  if (!token || !horChannelId || !postHotChannelTime) {
    console.error("Missing environment variables.");
    process.exit(1);
  }

  await loadCommands(client);
  setupEventHandlers(client, userStates);
  scheduleHotChannels(client, horChannelId, postHotChannelTime);

  await client.login(token);
  console.log("Bot is running...");
}

main().catch(console.error);
