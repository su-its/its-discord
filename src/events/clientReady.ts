import { Events } from 'discord.js';
import { CustomClient } from '../types/customClient';

export function setupClientReadyHandler(client: CustomClient) {
    client.once(Events.ClientReady, () => {
        console.log('Ready!');
        if (client.user) {
            console.log(`Logged in as ${client.user.tag}`);
        }
    });
}
