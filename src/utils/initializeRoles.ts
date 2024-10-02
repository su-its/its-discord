import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Guild } from "discord.js";
import type CustomRole from "../types/customRole";
import createRoleIfNotFound from "./createRoleNotFound";

async function readRolesFromDirectory(directoryPath: string, guild: Guild) {
  const files = readdirSync(directoryPath);
  for (const file of files) {
    const fullPath = join(directoryPath, file);
    if (statSync(fullPath).isDirectory()) {
      await readRolesFromDirectory(fullPath, guild);
    } else if (fullPath.endsWith("ts")) {
      try {
        const module = await import(fullPath);
        const roleConfig = module.default || module;
        if (roleConfig?.roleName && roleConfig.color && roleConfig.reason) {
          await initializeRole(roleConfig, guild);
        } else {
          console.error(`Failed to load a valid role config from ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error importing file ${fullPath}: ${error}`);
      }
    }
  }
}

async function initializeRole(roleConfig: CustomRole, guild: Guild) {
  await createRoleIfNotFound({ guild, customRole: roleConfig });
}

async function initializeRoles(guild: Guild) {
  const rolesDirectory = resolve(__dirname, "../roles");
  await readRolesFromDirectory(rolesDirectory, guild);
}

export default initializeRoles;
