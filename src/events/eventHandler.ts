import { CustomClient } from '../types/customClient';
import { setupClientReadyHandler } from './clientReady';
import { setupInteractionCreateHandler } from './interactionCreate';
import { setupGuildMemberAddHandler } from './guildMemberAdd';

export function setupEventHandlers(client: CustomClient) {
    setupClientReadyHandler(client);
    setupInteractionCreateHandler(client);
    setupGuildMemberAddHandler(client);
}
