import { Events } from 'discord.js';
import { CustomClient } from '../types/customClient';

export function setupGuildMemberAddHandler(client: CustomClient) {
    client.on(Events.GuildMemberAdd, async member => {
        member.send(`ようこそ ${member.displayName} さん！...`)
            .catch(console.error);
    });
}
