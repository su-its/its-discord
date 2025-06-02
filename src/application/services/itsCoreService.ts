import type { ITSCorePort } from "../ports/itsCorePort";

/**
 * DIコンテナ - ITSCorePortの実装を注入するためのシングルトン
 */
class ITSCoreServiceContainer {
  private _itsCorePort: ITSCorePort | null = null;

  /**
   * ITSCorePortの実装を注入する
   */
  setITSCorePort(port: ITSCorePort): void {
    this._itsCorePort = port;
  }

  /**
   * ITSCorePortの実装を取得する
   */
  getITSCorePort(): ITSCorePort {
    if (!this._itsCorePort) {
      throw new Error(
        "ITSCorePort is not initialized. Call setITSCorePort() first.",
      );
    }
    return this._itsCorePort;
  }
}

// シングルトンインスタンス
export const itsCoreServiceContainer = new ITSCoreServiceContainer();

/**
 * Application層でITSCorePortを使用するためのサービスクラス
 * ヘキサゴナルアーキテクチャに従い、Portのみに依存
 */
export class ITSCoreService {
  private get port(): ITSCorePort {
    return itsCoreServiceContainer.getITSCorePort();
  }

  async registerMember(
    data: Parameters<ITSCorePort["registerMember"]>[0],
  ): Promise<void> {
    return this.port.registerMember(data);
  }

  async getMemberByDiscordId(
    discordId: string,
  ): Promise<ReturnType<ITSCorePort["getMemberByDiscordId"]>> {
    return this.port.getMemberByDiscordId(discordId);
  }

  async getMemberByEmail(
    email: string,
  ): Promise<ReturnType<ITSCorePort["getMemberByEmail"]>> {
    return this.port.getMemberByEmail(email);
  }

  async connectDiscordAccount(
    data: Parameters<ITSCorePort["connectDiscordAccount"]>[0],
  ): Promise<void> {
    return this.port.connectDiscordAccount(data);
  }

  async getMemberList(): Promise<ReturnType<ITSCorePort["getMemberList"]>> {
    return this.port.getMemberList();
  }

  async updateMemberNickname(
    data: Parameters<ITSCorePort["updateMemberNickname"]>[0],
  ): Promise<ReturnType<ITSCorePort["updateMemberNickname"]>> {
    return this.port.updateMemberNickname(data);
  }
}

// Application層で使用するサービスインスタンス
export const itsCoreService = new ITSCoreService();
