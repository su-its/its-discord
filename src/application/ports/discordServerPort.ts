import type InternalMember from "../../domain/entities/member";
import type Role from "../../domain/types/role";

/**
 * Discord関連の操作に必要な基本的な型
 */
export interface DiscordChannel {
  id: string;
  name: string;
  type: "text" | "voice" | "category" | "other";
}

export interface DiscordMember {
  id: string;
  displayName: string;
  nickname?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
}

export interface DiscordMessage {
  id: string;
  createdTimestamp: number;
}

export interface ChannelActivityData {
  id: string;
  name: string;
  count: number;
}

export interface EmbedData {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
}

export interface MemberRenameResult {
  successCount: number;
  failureCount: number;
  failedMembers: DiscordMember[];
}

/**
 * Discordサーバーの操作を抽象化するPort（ヘキサゴナルアーキテクチャ）
 * Application層はこのインターフェースのみに依存し、Discord.jsの詳細を知らない
 */
export interface DiscordServerPort {
  /**
   * 指定されたギルドの全メンバーを取得する
   */
  getGuildMembers(guildId: string): Promise<DiscordMember[]>;

  /**
   * メンバーのニックネームを設定する
   */
  setMemberNickname(
    guildId: string,
    memberId: string,
    nickname: string,
  ): Promise<void>;

  /**
   * 指定されたギルドのテキストチャンネルを取得する
   */
  getTextChannels(guildId: string): Promise<DiscordChannel[]>;

  /**
   * チャンネルの過去24時間のメッセージ数を取得する
   */
  getChannelMessageCount(guildId: string, channelId: string): Promise<number>;

  /**
   * チャンネルにEmbedメッセージを送信する
   */
  sendEmbedToChannel(
    guildId: string,
    channelId: string,
    embed: EmbedData,
  ): Promise<void>;

  /**
   * ロールが存在しない場合は作成し、メンバーにロールを追加する
   */
  addRoleToMember(guildId: string, memberId: string, role: Role): Promise<void>;

  /**
   * メンバーからロールを削除する
   */
  removeRoleFromMember(
    guildId: string,
    memberId: string,
    role: Role,
  ): Promise<void>;

  /**
   * メンバーの部署に応じたロールを付与する
   */
  addDepartmentRoleToMember(
    guildId: string,
    memberId: string,
    member: InternalMember,
  ): Promise<void>;

  /**
   * 最初のギルドを取得する
   */
  getFirstGuild(): Promise<DiscordGuild>;

  /**
   * メンバーの全ニックネームを一括変更する
   */
  renameAllMembersInGuild(
    guildId: string,
    memberNameMap: Map<string, string>,
  ): Promise<MemberRenameResult>;

  /**
   * チャンネル活動ランキングのEmbedデータを生成する
   */
  generateChannelActivityEmbedData(guildId: string): Promise<EmbedData>;
}
