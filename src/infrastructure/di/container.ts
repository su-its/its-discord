import { discordServerServiceContainer } from "../../application/services/discordServerService";
import { itsCoreServiceContainer } from "../../application/services/itsCoreService";
import type { CustomClient } from "../../domain/types/customClient";
import { DiscordServerAdapter } from "../discordjs/discordServerAdapter";
import { itsCoreMemberRepository } from "../itscore/itsCoreAdaptor";

/**
 * 依存性注入の設定
 * Infrastructure層からApplication層への依存性を注入する
 */
export function setupDependencyInjection(client?: CustomClient): void {
  // ITSCorePortの実装を注入
  itsCoreServiceContainer.setITSCorePort(itsCoreMemberRepository);

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
