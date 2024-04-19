import { Guild } from "discord.js";
import createRoleIfNotFound from "./createRoleNotFound";
import { administratorRoleProperty } from "../roles/administrator";

// 使用するロールを初期化
async function initializeRoles(guild: Guild) {
    await createRoleIfNotFound({ guild, customRole: administratorRoleProperty });
}

export default initializeRoles;