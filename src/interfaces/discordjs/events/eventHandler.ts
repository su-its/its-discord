import type AuthData from "../../../domain/types/authData";
import type { CustomClient } from "../../../domain/types/customClient";
import { setupClientReadyHandler } from "./clientReady";
import { setupGuildMemberAddHandler } from "./guildMemberAdd";
import { setupInteractionCreateHandler } from "./interactionCreate";
import { setupMessageCreate } from "./messageCreate";

export function setupEventHandlers(
  client: CustomClient,
  userStates: Map<string, AuthData>,
  guildId: string,
) {
  setupClientReadyHandler(client, guildId);
  setupInteractionCreateHandler(client);
  setupGuildMemberAddHandler(client);
  setupMessageCreate(client, userStates);
}
