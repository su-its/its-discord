import fs from "node:fs/promises";
import path from "node:path";
import type { CustomClient } from "./types/customClient";

export async function loadCommands(client: CustomClient) {
	const commandsFoldersPath = path.resolve("src", "commands");
	const commandFiles = await fs.readdir(commandsFoldersPath);
	const tsCommandFiles = commandFiles.filter((file) => file.endsWith(".ts"));
	for (const file of tsCommandFiles) {
		const filePath = path.join(commandsFoldersPath, file);
		const { default: command } = await import(filePath);
		if (command.data && command.execute) {
			client.commands.set(command.data.name, command);
			console.log(`[INFO] Loaded command: ${command.data.name}`);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}
