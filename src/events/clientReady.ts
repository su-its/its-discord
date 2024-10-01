import { Events } from "discord.js";
import type { CustomClient } from "../types/customClient";
import initializeRoles from "../utils/initializeRoles";

export function setupClientReadyHandler(client: CustomClient) {
  client.once(Events.ClientReady, () => {
    console.log("Ready!");
    if (client.user) {
      console.log(`Logged in as ${client.user.tag}`);

      //guildのリストを取得
      const guilds = client.guilds.cache;
      if (guilds.size === 0) {
        console.error("No guild found.");
        throw new Error("No guild found.");
      }
      for (const [, guild] of guilds) {
        initializeRoles(guild);
      }
    }
  });
}
