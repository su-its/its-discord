import { Events, Guild } from "discord.js";
import { CustomClient } from "../types/customClient";
import initializeRoles from "../utils/initializeRoles";

export function setupClientReadyHandler(client: CustomClient) {
  client.once(Events.ClientReady, () => {
    console.log("Ready!");
    if (client.user) {
      console.log(`Logged in as ${client.user.tag}`);


      // ロールを初期化
      const guild: Guild | undefined = client.guilds.cache.first();
      if (!guild) {
        console.error("No guild found.");
        throw new Error("No guild found.");
      } else {
        initializeRoles(guild);
      }
    }
  });
}
