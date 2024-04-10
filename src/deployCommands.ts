import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from './types/command';
import dotenv from 'dotenv';

const commandHandlers: Command[] = [];

// Discord APIに登録するためのコマンドデータの配列
const commandData: SlashCommandBuilder[] = [];

function readCommands(directory: string): void {
    const filesOrFolders = fs.readdirSync(directory);

    filesOrFolders.forEach(entry => {
        const absolutePath = path.join(directory, entry);
        if (fs.statSync(absolutePath).isDirectory()) {
            readCommands(absolutePath);
        } else if (entry.endsWith('.ts')) {
            const command: Command = require(absolutePath).default;
            if ('data' in command && 'execute' in command) {
                commandHandlers.push(command);
                commandData.push(command.data);
            } else {
                console.log(`[WARNING] The command at ${absolutePath} is missing a required "data" or "execute" property.`);
            }
        }
    });
}

function checkEnvVariables() {
    dotenv.config();
    const token = process.env.TOKEN;
    const clientId = process.env.APP_ID;
    const guildId = process.env.GUILD_ID;

    if (!token || !clientId || !guildId) {
        console.error('Missing environment variables.');
        process.exit(1);
    }
    return { token, clientId, guildId };
}

// コマンドをデプロイする関数
async function deployCommands(token: string, clientId: string, guildId: string) {
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        console.log(`Started refreshing ${commandData.length} application (/) commands.`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commandData },
        );
        console.log(`Successfully reloaded ${commandData.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}

// メイン処理
const commandsPath = path.join(__dirname, 'commands');
readCommands(commandsPath);

const { token, clientId, guildId } = checkEnvVariables();
deployCommands(token, clientId, guildId).catch(console.error);
