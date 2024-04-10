import { Collection } from 'discord.js'
import dotenv from 'dotenv'
import { CustomClient } from './types/customClient';
import { Command } from './types/command';
import fs from 'fs';
import path from 'path';

dotenv.config()

const client = new CustomClient();
client.commands = new Collection<string, Command>();

const commandsFoldersPath = 'src/commands';

const commandFiles = fs.readdirSync(commandsFoldersPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsFoldersPath, file);
    const command: Command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

//Botの起動を確認
client.once('ready', () => {
    console.log('Ready!')
    if (client.user) {
        console.log(client.user.tag)
    }
});