import { Events } from "discord.js";
import type { Guild } from "discord.js";
import type { CustomClient } from "../../domain/types/customClient";
import createRoleIfNotFound from "../../utils/createRoleNotFound";
import roleRegistry from "../roles";

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

function initializeRoles(guild: Guild) {
  // RoleRegistry から登録済みの全ロールを取得
  const roles = roleRegistry.getAllRoles();
  for (const role of roles) {
    // 各ロールについて、存在しなければ作成する処理を実行
    createRoleIfNotFound({ guild, role });
  }
}
