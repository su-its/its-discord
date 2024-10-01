import type AuthData from "../types/authData";
import type { CustomClient } from "../types/customClient";
import { setupClientReadyHandler } from "./clientReady";
import { setupGuildMemberAddHandler } from "./guildMemberAdd";
import { setupInteractionCreateHandler } from "./interactionCreate";
import { setupMessageCreate } from "./messageCreate";

export function setupEventHandlers(
  client: CustomClient,
  userStates: Map<string, AuthData>,
) {
  setupClientReadyHandler(client);
  setupInteractionCreateHandler(client);
  setupGuildMemberAddHandler(client);
  setupMessageCreate(client, userStates);
}
