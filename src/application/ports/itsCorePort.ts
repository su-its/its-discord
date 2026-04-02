import type Member from "../../domain/entities/member";

/**
 * ITSCoreとの連携に必要な最小限のデータ型
 */
export interface MemberRegistrationData<TAffiliation = unknown> {
  email: string;
  name: string;
  studentId: string;
  affiliation: TAffiliation;
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
 *
 * @typeParam TAffiliation registerMember で使用する所属データの型。
 * adapter が具体型（CompleteAffiliation 等）をバインドする。
 */
export interface ITSCorePort<TAffiliation = unknown> {
  /**
   * 新しいメンバーを登録する
   */
  registerMember(data: MemberRegistrationData<TAffiliation>): Promise<void>;

  /**
   * DiscordIDでメンバーを取得する
   */
  getMemberByDiscordId(discordId: string): Promise<Member | undefined>;

  /**
   * メールアドレスでメンバーを取得する
   */
  getMemberByEmail(email: string): Promise<Member | undefined>;

  /**
   * DiscordアカウントとITSCoreアカウントを紐づける
   */
  connectDiscordAccount(data: MemberConnectionData): Promise<void>;

  /**
   * 全メンバーのリストを取得する
   */
  getMemberList(): Promise<Member[]>;

  /**
   * メンバーのDiscordニックネームを変更する
   */
  updateMemberNickname(data: MemberNicknameUpdateData): Promise<void>;
}
