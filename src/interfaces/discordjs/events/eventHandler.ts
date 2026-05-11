import type { AppDeps } from "@application/ports";
import type { CustomClient } from "@domain/types";
import { setupClientReadyHandler } from "./clientReady";
import { setupGuildMemberAddHandler } from "./guildMemberAdd";
import { setupInteractionCreateHandler } from "./interactionCreate";
import { setupModalSubmitHandler } from "./modalSubmit";

export function setupEventHandlers(
  client: CustomClient,
  guildId: string,
  deps: AppDeps,
) {
  setupClientReadyHandler(client, guildId, deps);
  setupInteractionCreateHandler(client, deps);
  setupGuildMemberAddHandler(client, deps);
  setupModalSubmitHandler(client, deps);
}
