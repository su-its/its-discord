import { discordServerServiceContainer } from "../../application/services/discordServerService";
import { emailAuthServiceContainer } from "../../application/services/emailAuthService";
import { itsCoreServiceContainer } from "../../application/services/itsCoreService";
import { scheduledMessageServiceContainer } from "../../application/services/scheduledMessageService";
import type { CustomClient } from "../../domain/types/customClient";
import { DiscordServerAdapter } from "../discordjs/discordServerAdapter";
import { FirebaseEmailAuthAdapter } from "../firebase/firebaseEmailAuthAdapter";
import { itsCoreMemberRepository } from "../itscore/itsCoreAdaptor";
import { memoryScheduledMessageRepository } from "../memory/scheduledMessageRepository";

/**
 * 依存性注入の設定
 * Infrastructure層からApplication層への依存性を注入する
 */
export function setupDependencyInjection(client?: CustomClient): void {
  // ITSCorePortの実装を注入
  itsCoreServiceContainer.setITSCorePort(itsCoreMemberRepository);

  // ScheduledMessagePortの実装を注入
  scheduledMessageServiceContainer.setScheduledMessagePort(
    memoryScheduledMessageRepository,
  );

  // EmailAuthPortの実装を注入
  emailAuthServiceContainer.setEmailAuthPort(new FirebaseEmailAuthAdapter());

  // DiscordServerPortの実装を注入（クライアントが利用可能な場合のみ）
  if (client) {
    const discordServerAdapter = new DiscordServerAdapter(client);
    discordServerServiceContainer.setDiscordServerPort(discordServerAdapter);
  }
}

/**
 * アプリケーション起動時に依存性注入を実行
 * DiscordServerAdapterはクライアント初期化後に別途設定される
 */
setupDependencyInjection();
