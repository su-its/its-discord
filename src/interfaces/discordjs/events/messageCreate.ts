import { ChannelType, Events, type Message } from "discord.js";
import { handleDMAuthFlow } from "../../../application/usecases/handleDMAuthFlow";
import type AuthData from "../../../domain/types/authData";
import type { CustomClient } from "../../../domain/types/customClient";

export function setupMessageCreate(client: CustomClient, userStates: Map<string, AuthData>) {
  client.on(Events.MessageCreate, async (message: Message) => {
    // BOTからのメッセージとDM以外は無視
    if (message.author.bot || message.channel.type !== ChannelType.DM) return;

    // DM認証フローをUsecaseに委譲
    await handleDMAuthFlow(message.author.id, message.content, userStates, async (replyText: string) => {
      await message.reply(replyText);
    });
  });
}
