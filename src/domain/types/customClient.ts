import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import type Command from "./command";

// TODO: このクラスは何をするのかinlineドキュメント https://github.com/su-its/its-discord/issues/25
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
