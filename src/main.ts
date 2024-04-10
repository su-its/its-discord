import { CustomClient } from './types/customClient';
import dotenv from 'dotenv';
import { loadCommands } from './loadCommands';
import { setupEventHandlers } from './events/eventHandler';
import { getAllMembers } from './controllers/MemberController';

dotenv.config();

const client = new CustomClient();
const token = process.env.TOKEN;

async function main() {
    if (!token) {
        console.error('Missing environment variables.');
        process.exit(1);
    }

    await loadCommands(client);
    setupEventHandlers(client);

    await client.login(token);
    console.log('Bot is running...');
}

main().catch(console.error);
