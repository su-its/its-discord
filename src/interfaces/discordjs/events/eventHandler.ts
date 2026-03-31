import type { CustomClient } from "../../../domain/types/customClient";
import { setupClientReadyHandler } from "./clientReady";
import { setupGuildMemberAddHandler } from "./guildMemberAdd";
import { setupInteractionCreateHandler } from "./interactionCreate";
import { setupModalSubmitHandler } from "./modalSubmit";

export function setupEventHandlers(client: CustomClient, guildId: string) {
  setupClientReadyHandler(client, guildId);
  setupInteractionCreateHandler(client);
  setupGuildMemberAddHandler(client);
  setupModalSubmitHandler(client);
}
