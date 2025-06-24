import type { CustomClient } from "../../../domain/types/customClient";
import { setupClientReadyHandler } from "./clientReady";
import { setupGuildMemberAddHandler } from "./guildMemberAdd";
import { setupInteractionCreateHandler } from "./interactionCreate";

export function setupEventHandlers(client: CustomClient) {
  setupClientReadyHandler(client);
  setupInteractionCreateHandler(client);
  setupGuildMemberAddHandler(client);
}
