import type Role from "../../domain/types/role";
import type { DiscordChannel, DiscordChannelPort } from "../ports/discordChannelPort";
import type { DiscordGuildPort } from "../ports/discordGuildPort";
import type { DiscordMember, DiscordMemberPort } from "../ports/discordMemberPort";
import type { DiscordMessagePort } from "../ports/discordMessagePort";

/**
 * DIコンテナ - 分割されたDiscord Portの実装を注入するためのシングルトン
 */
class DiscordServerServiceContainer {
  private _discordMemberPort: DiscordMemberPort | null = null;
  private _discordChannelPort: DiscordChannelPort | null = null;
  private _discordGuildPort: DiscordGuildPort | null = null;
  private _discordMessagePort: DiscordMessagePort | null = null;

  /**
   * 複数のPortの実装を一括で注入する（Adapterが複数のPortを実装している場合）
   */
  setDiscordPorts(
    memberPort: DiscordMemberPort,
    channelPort: DiscordChannelPort,
    guildPort: DiscordGuildPort,
    messagePort: DiscordMessagePort
  ): void {
    this._discordMemberPort = memberPort;
    this._discordChannelPort = channelPort;
    this._discordGuildPort = guildPort;
    this._discordMessagePort = messagePort;
  }

  /**
   * 統合Adapterから個別のPortを注入する（後方互換性のため）
   */
  setDiscordServerPort(adapter: DiscordMemberPort & DiscordChannelPort & DiscordGuildPort & DiscordMessagePort): void {
    this.setDiscordPorts(adapter, adapter, adapter, adapter);
  }

  getDiscordMemberPort(): DiscordMemberPort {
    if (!this._discordMemberPort) {
      throw new Error("DiscordMemberPort is not initialized. Call setDiscordPorts() first.");
    }
    return this._discordMemberPort;
  }

  getDiscordChannelPort(): DiscordChannelPort {
    if (!this._discordChannelPort) {
      throw new Error("DiscordChannelPort is not initialized. Call setDiscordPorts() first.");
    }
    return this._discordChannelPort;
  }

  getDiscordGuildPort(): DiscordGuildPort {
    if (!this._discordGuildPort) {
      throw new Error("DiscordGuildPort is not initialized. Call setDiscordPorts() first.");
    }
    return this._discordGuildPort;
  }

  getDiscordMessagePort(): DiscordMessagePort {
    if (!this._discordMessagePort) {
      throw new Error("DiscordMessagePort is not initialized. Call setDiscordPorts() first.");
    }
    return this._discordMessagePort;
  }
}

// シングルトンインスタンス
export const discordServerServiceContainer = new DiscordServerServiceContainer();

/**
 * Application層で分割されたDiscord Portを使用するためのサービスクラス
 * ヘキサゴナルアーキテクチャに従い、Portのみに依存
 */
export class DiscordServerService {
  // Member operations
  async getGuildMembers(guildId: string): Promise<DiscordMember[]> {
    return discordServerServiceContainer.getDiscordMemberPort().getGuildMembers(guildId);
  }

  async setMemberNickname(guildId: string, memberId: string, nickname: string): Promise<void> {
    return discordServerServiceContainer.getDiscordMemberPort().setMemberNickname(guildId, memberId, nickname);
  }

  async addRoleToMember(guildId: string, memberId: string, role: Role): Promise<void> {
    return discordServerServiceContainer.getDiscordMemberPort().addRoleToMember(guildId, memberId, role);
  }

  async removeRoleFromMember(guildId: string, memberId: string, role: Role): Promise<void> {
    return discordServerServiceContainer.getDiscordMemberPort().removeRoleFromMember(guildId, memberId, role);
  }

  // Channel operations
  async getTextChannels(guildId: string): Promise<DiscordChannel[]> {
    return discordServerServiceContainer.getDiscordChannelPort().getTextChannels(guildId);
  }

  async getChannelMessageCount(channelId: string): Promise<number> {
    return discordServerServiceContainer.getDiscordChannelPort().getChannelMessageCount(channelId);
  }

  async sendEmbedToChannel(
    channelId: string,
    embed: {
      title: string;
      description: string;
      color: number;
      thumbnail?: { url: string };
      image?: { url: string };
      fields?: { name: string; value: string; inline?: boolean }[];
      footer?: { text: string; iconURL?: string };
      timestamp?: string;
    }
  ): Promise<void> {
    return discordServerServiceContainer.getDiscordChannelPort().sendEmbedToChannel(channelId, embed);
  }

  // Guild operations
  async getFirstGuild(): Promise<string> {
    return discordServerServiceContainer.getDiscordGuildPort().getFirstGuild();
  }

  async ensureRoleExists(guildId: string, role: Role): Promise<void> {
    return discordServerServiceContainer.getDiscordGuildPort().ensureRoleExists(guildId, role);
  }

  // Message operations
  async sendDirectMessage(userId: string, message: string): Promise<void> {
    return discordServerServiceContainer.getDiscordMessagePort().sendDirectMessage(userId, message);
  }

  async sendMessageToChannel(channelId: string, message: string): Promise<void> {
    return discordServerServiceContainer.getDiscordMessagePort().sendMessageToChannel(channelId, message);
  }
}

// Application層で使用するサービスインスタンス
export const discordServerService = new DiscordServerService();
