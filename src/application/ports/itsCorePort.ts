import type Member from "../../domain/entities/member";

/**
 * ITSCoreとの連携に必要な最小限のデータ型
 * courseType / selections / year はプリミティブで表現し、
 * 具体的な所属型への変換は adapter 側が担当する
 */
export interface MemberRegistrationData {
  email: string;
  name: string;
  studentId: string;
  courseType: string;
  affiliationSelections: Record<string, string>;
  year: number;
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
