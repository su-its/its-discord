import { GatewayIntentBits, Client, Partials, Collection } from 'discord.js'
import { Command } from './command';

export class CustomClient extends Client {
    public commands: Collection<string, Command>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Message, Partials.Channel],
        });
        this.commands = new Collection();
    }
}
