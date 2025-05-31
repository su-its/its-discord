import type InternalMember from "../../domain/entities/member";
import type Role from "../../domain/types/role";
import type {
  DiscordMember,
  DiscordServerPort,
  EmbedData,
  MemberRenameResult,
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

  async addDepartmentRoleToMember(
    guildId: string,
    memberId: string,
    member: InternalMember,
  ): Promise<void> {
    return this.port.addDepartmentRoleToMember(guildId, memberId, member);
  }

  async getFirstGuild(): Promise<
    ReturnType<DiscordServerPort["getFirstGuild"]>
  > {
    return this.port.getFirstGuild();
  }

  async renameAllMembersInGuild(
    guildId: string,
    memberNameMap: Map<string, string>,
  ): Promise<MemberRenameResult> {
    return this.port.renameAllMembersInGuild(guildId, memberNameMap);
  }

  async generateChannelActivityEmbedData(guildId: string): Promise<EmbedData> {
    return this.port.generateChannelActivityEmbedData(guildId);
  }

  async sendEmbedToChannel(
    guildId: string,
    channelId: string,
    embed: EmbedData,
  ): Promise<void> {
    return this.port.sendEmbedToChannel(guildId, channelId, embed);
  }
}

// Application層で使用するサービスインスタンス
export const discordServerService = new DiscordServerService();
