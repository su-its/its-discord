import { CustomClient } from "./types/customClient";
import dotenv from "dotenv";
import { loadCommands } from "./loadCommands";
import { setupEventHandlers } from "./events/eventHandler";
import AuthData from "./types/authData";
import { scheduleHotChannels } from "./tasks/scheduleHotChannels";

dotenv.config();

const client = new CustomClient();
const token = process.env.TOKEN;
const userStates = new Map<string, AuthData>();
const horChannelId = process.env.HOT_CHANNEL_ID;
const postHotChannelTime = process.env.POST_HOT_CHANNEL_TIME;

async function main() {
  if (!token) {
    console.error("Missing environment variables.");
    process.exit(1);
  }

  await loadCommands(client);
  setupEventHandlers(client, userStates);
  scheduleHotChannels(client, horChannelId!, postHotChannelTime!);

  await client.login(token);
  console.log("Bot is running...");
}

main().catch(console.error);
