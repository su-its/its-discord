import { GatewayIntentBits, Client, Partials, Collection } from 'discord.js'
import { Command } from './command';

export class CustomClient extends Client {
    public commands: Collection<string, Command>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildInvites,
            ],
            partials: [Partials.Message, Partials.Channel],
        });
        this.commands = new Collection();
    }
}
