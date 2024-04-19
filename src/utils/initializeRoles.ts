import { Guild } from "discord.js";
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import createRoleIfNotFound from "./createRoleNotFound";
import CustomRole from "../types/customRole";

async function readRolesFromDirectory(directoryPath: string, guild: Guild) {
  let files = readdirSync(directoryPath);

  for (const file of files) {
    const fullPath = join(directoryPath, file);
    if (statSync(fullPath).isDirectory()) {
      await readRolesFromDirectory(fullPath, guild);
    } else if (fullPath.endsWith('ts')) {
      try {
        const exported = require(fullPath);
        const roleConfig = exported.default || exported;
        if (roleConfig && roleConfig.roleName && roleConfig.color && roleConfig.reason) {
          await initializeRole(roleConfig, guild);
        } else {
          console.error(`Failed to load a valid role config from ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error requiring file ${fullPath}: ${error}`);
      }
    }
  }
}

async function initializeRole(roleConfig: CustomRole, guild: Guild) {
  await createRoleIfNotFound({ guild, customRole: roleConfig });
}

async function initializeRoles(guild: Guild) {
  const rolesDirectory = resolve(__dirname, '../roles');
  await readRolesFromDirectory(rolesDirectory, guild);
}

export default initializeRoles;
