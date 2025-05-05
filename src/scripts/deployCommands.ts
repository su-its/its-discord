import { REST, Routes, type SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import type Command from "../domain/types/command";
import logger from "../infrastructure/logger";
import registry from "../interfaces/discordjs/commands";

function checkEnvVariables() {
  dotenv.config();
  const token = process.env.TOKEN;
  const clientId = process.env.APP_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    logger.error("Missing environment variables.");
    process.exit(1);
  }
  return { token, clientId, guildId };
}

// コマンドをデプロイする関数
async function deployCommands(
  token: string,
  clientId: string,
  guildId: string,
) {
  const rest = new REST({ version: "10" }).setToken(token);

  // Registryから全てのコマンドを取得
  const allCommands: Command[] = registry.getAllCommands();

  // Discord APIに登録するためのコマンドデータの配列を生成
  const commandData: SlashCommandBuilder[] = allCommands.map(
    (command) => command.data,
  );

  logger.info(
    `Started refreshing ${commandData.length} application (/) commands.`,
  );
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandData,
    });
    logger.info(
      `Successfully reloaded ${commandData.length} application (/) commands.`,
    );
  } catch (error) {
    logger.error("Failed to deploy commands:", error);
    throw error;
  }
}

async function main() {
  const { token, clientId, guildId } = checkEnvVariables();
  await deployCommands(token, clientId, guildId);
}

main().catch((error) =>
  logger.error("Failed to execute main function:", error),
);
