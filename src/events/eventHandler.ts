import { CustomClient } from "../types/customClient";
import { setupClientReadyHandler } from "./clientReady";
import { setupInteractionCreateHandler } from "./interactionCreate";
import { setupGuildMemberAddHandler } from "./guildMemberAdd";
import { setupMessageCreate } from "./messageCreate";
import AuthData from "../types/authData";

export function setupEventHandlers(client: CustomClient, userStates: Map<string, AuthData>) {
  setupClientReadyHandler(client);
  setupInteractionCreateHandler(client);
  setupGuildMemberAddHandler(client);
  setupMessageCreate(client, userStates);
}
