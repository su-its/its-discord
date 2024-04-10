import { CommandInteraction } from 'discord.js';

export interface Command {
    data: {
        name: string;
        description: string;
    };
    execute: (interaction: CommandInteraction) => void;
}
