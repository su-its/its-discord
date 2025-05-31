import type InternalMember from "../../domain/entities/member";
import type Role from "../../domain/types/role";
import type {
  DiscordMember,
  DiscordServerPort,
  EmbedData,
} from "../ports/discordServerPort";

/**
 * DIコンテナ - DiscordServerPortの実装を注入するためのシングルトン
 */
class DiscordServerServiceContainer {
  private _discordServerPort: DiscordServerPort | null = null;

  /**
   * DiscordServerPortの実装を注入する
   */
  setDiscordServerPort(port: DiscordServerPort): void {
    this._discordServerPort = port;
  }

  /**
   * DiscordServerPortの実装を取得する
   */
  getDiscordServerPort(): DiscordServerPort {
    if (!this._discordServerPort) {
      throw new Error(
        "DiscordServerPort is not initialized. Call setDiscordServerPort() first.",
      );
    }
    return this._discordServerPort;
  }
}

// シングルトンインスタンス
export const discordServerServiceContainer =
  new DiscordServerServiceContainer();

/**
 * Application層でDiscordServerPortを使用するためのサービスクラス
 * ヘキサゴナルアーキテクチャに従い、Portのみに依存
 */
export class DiscordServerService {
  private get port(): DiscordServerPort {
    return discordServerServiceContainer.getDiscordServerPort();
  }

  async getGuildMembers(guildId: string): Promise<DiscordMember[]> {
    return this.port.getGuildMembers(guildId);
  }

  async setMemberNickname(
    guildId: string,
    memberId: string,
    nickname: string,
  ): Promise<void> {
    return this.port.setMemberNickname(guildId, memberId, nickname);
  }

  async getTextChannels(
    guildId: string,
  ): Promise<ReturnType<DiscordServerPort["getTextChannels"]>> {
    return this.port.getTextChannels(guildId);
  }

  async getChannelMessageCount(
    guildId: string,
    channelId: string,
  ): Promise<number> {
    return this.port.getChannelMessageCount(guildId, channelId);
  }

  async addRoleToMember(
    guildId: string,
    memberId: string,
    role: Role,
  ): Promise<void> {
    return this.port.addRoleToMember(guildId, memberId, role);
  }

  async removeRoleFromMember(
    guildId: string,
    memberId: string,
    role: Role,
  ): Promise<void> {
    return this.port.removeRoleFromMember(guildId, memberId, role);
  }

  async ensureRoleExists(guildId: string, role: Role): Promise<void> {
    return this.port.ensureRoleExists(guildId, role);
  }

  async getFirstGuild(): Promise<
    ReturnType<DiscordServerPort["getFirstGuild"]>
  > {
    return this.port.getFirstGuild();
  }

  async sendEmbedToChannel(
    guildId: string,
    channelId: string,
    embed: EmbedData,
  ): Promise<void> {
    return this.port.sendEmbedToChannel(guildId, channelId, embed);
  }

  async sendDirectMessage(memberId: string, message: string): Promise<void> {
    return this.port.sendDirectMessage(memberId, message);
  }
}

// Application層で使用するサービスインスタンス
export const discordServerService = new DiscordServerService();
