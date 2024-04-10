import { Collection, Events } from 'discord.js';
import { CustomClient } from './types/customClient';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const client = new CustomClient();
client.commands = new Collection();

const commandsFoldersPath = path.resolve('src', 'commands');

async function loadCommands() {
    const commandFiles = await fs.readdir(commandsFoldersPath);
    const jsCommandFiles = commandFiles.filter(file => file.endsWith('.ts'));

    for (const file of jsCommandFiles) {
        const filePath = path.join(commandsFoldersPath, file);
        const { default: command } = await import(filePath);
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once(Events.ClientReady, () => {
    console.log('Ready!');
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}`);
    }
    loadCommands().catch(console.error);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as CustomClient).commands.get(interaction.commandName);


    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

const token = process.env.TOKEN;
if (!token) {
    console.error('Missing environment variables.');
    process.exit(1);
}

client.login(token).then(() => console.log('Bot is running...')).catch(console.error);
