import { discordServerServiceContainer } from "../../application/services/discordServerService";
import { emailAuthServiceContainer } from "../../application/services/emailAuthService";
import { itsCoreServiceContainer } from "../../application/services/itsCoreService";
import { scheduledMessageServiceContainer } from "../../application/services/scheduledMessageService";
import type { AdapterConfig } from "../../config/environment";
import type { CustomClient } from "../../domain/types/customClient";
import { DiscordServerAdapter } from "../discordjs/discordServerAdapter";
import { InMemoryEmailAuthAdapter } from "../in-memory/inMemoryEmailAuthAdapter";
import { InMemoryITSCoreAdapter } from "../in-memory/inMemoryITSCoreAdapter";
import logger from "../logger";
import { memoryScheduledMessageRepository } from "../memory/scheduledMessageRepository";

function setupITSCorePort(adapterType: AdapterConfig["itsCore"]): void {
  if (adapterType === "in-memory") {
    itsCoreServiceContainer.setITSCorePort(new InMemoryITSCoreAdapter());
    logger.info("ITSCore: in-memory adapter");
    return;
  }
  const { itsCoreMemberRepository } = require("../itscore/itsCoreAdaptor");
  itsCoreServiceContainer.setITSCorePort(itsCoreMemberRepository);
  logger.info("ITSCore: production adapter");
}

function setupEmailAuthPort(adapterType: AdapterConfig["emailAuth"]): void {
  if (adapterType === "in-memory") {
    emailAuthServiceContainer.setEmailAuthPort(new InMemoryEmailAuthAdapter());
    logger.info("EmailAuth: in-memory adapter");
    return;
  }
  const {
    FirebaseEmailAuthAdapter,
  } = require("../firebase/firebaseEmailAuthAdapter");
  emailAuthServiceContainer.setEmailAuthPort(new FirebaseEmailAuthAdapter());
  logger.info("EmailAuth: firebase adapter");
}

/**
 * 依存性注入の設定
 * AdapterConfig に基づいて各 Port の実装を選択・注入する
 */
export function setupDependencyInjection(
  adapters: AdapterConfig,
  client?: CustomClient,
): void {
  setupITSCorePort(adapters.itsCore);
  setupEmailAuthPort(adapters.emailAuth);

  // ScheduledMessagePortの実装を注入
  scheduledMessageServiceContainer.setScheduledMessagePort(
    memoryScheduledMessageRepository,
  );

  // DiscordServerPortの実装を注入（クライアントが利用可能な場合のみ）
  if (client) {
    const discordServerAdapter = new DiscordServerAdapter(client);
    discordServerServiceContainer.setDiscordServerPort(discordServerAdapter);
  }
}
