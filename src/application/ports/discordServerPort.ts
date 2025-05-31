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
   * ギルドにロールを作成する（存在しない場合のみ）
   */
  ensureRoleExists(guildId: string, role: Role): Promise<void>;

  /**
   * 最初のギルドを取得する
   */
  getFirstGuild(): Promise<DiscordGuild>;

  /**
   * メンバーにDMを送信する
   */
  sendDirectMessage(memberId: string, message: string): Promise<void>;
}
