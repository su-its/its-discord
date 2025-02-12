import { REST, Routes, type SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import registry from "../application/commands";
import type Command from "../domain/types/command";

function checkEnvVariables() {
  dotenv.config();
  const token = process.env.TOKEN;
  const clientId = process.env.APP_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    console.error("Missing environment variables.");
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

  console.log(
    `Started refreshing ${commandData.length} application (/) commands.`,
  );
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandData,
    });
    console.log(
      `Successfully reloaded ${commandData.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  const { token, clientId, guildId } = checkEnvVariables();
  await deployCommands(token, clientId, guildId);
}

main().catch(console.error);
