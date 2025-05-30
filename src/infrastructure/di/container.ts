import { itsCoreServiceContainer } from "../../application/services/itsCoreService";
import { itsCoreMemberRepository } from "../itscore/memberService";

/**
 * 依存性注入の設定
 * Infrastructure層からApplication層への依存性を注入する
 */
export function setupDependencyInjection(): void {
  // ITSCorePortの実装を注入
  itsCoreServiceContainer.setITSCorePort(itsCoreMemberRepository);
}

/**
 * アプリケーション起動時に依存性注入を実行
 */
setupDependencyInjection();
