// TODO: Port が @shizuoka-its/core に直接依存している。InternalMember リモデリング時に
// domain 層の型として再定義し、adapter でマッピングする設計に移行を検討する
import type { CompleteAffiliation } from "@shizuoka-its/core";
import type InternalMember from "../../domain/entities/member";

/**
 * ITSCoreとの連携に必要な最小限のデータ型
 */
export interface MemberRegistrationData {
  email: string;
  name: string;
  studentId: string;
  affiliation: CompleteAffiliation;
}

export interface MemberConnectionData {
  memberId: string;
  discordAccountId: string;
}

export interface MemberNicknameUpdateData {
  discordAccountId: string;
  discordNickName: string;
}

/**
 * ITSCoreへのアクセスを抽象化するPort（ヘキサゴナルアーキテクチャ）
 * Application層はこのインターフェースのみに依存し、Infrastructure層の詳細を知らない
 */
export interface ITSCorePort {
  /**
   * 新しいメンバーを登録する
   */
  registerMember(data: MemberRegistrationData): Promise<void>;

  /**
   * DiscordIDでメンバーを取得する
   */
  getMemberByDiscordId(discordId: string): Promise<InternalMember | undefined>;

  /**
   * メールアドレスでメンバーを取得する
   */
  getMemberByEmail(email: string): Promise<InternalMember | undefined>;

  /**
   * DiscordアカウントとITSCoreアカウントを紐づける
   */
  connectDiscordAccount(data: MemberConnectionData): Promise<void>;

  /**
   * 全メンバーのリストを取得する
   */
  getMemberList(): Promise<InternalMember[]>;

  /**
   * メンバーのDiscordニックネームを変更する
   */
  updateMemberNickname(data: MemberNicknameUpdateData): Promise<void>;
}
