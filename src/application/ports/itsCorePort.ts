import type InternalMember from "../../domain/entities/member";

/**
 * ITSCoreとの連携に必要な最小限のデータ型
 */
export interface MemberRegistrationData {
  email: string;
  name: string;
  department: string;
  studentId: string;
}

export interface MemberConnectionData {
  memberId: string;
  discordAccountId: string;
  discordNickName: string;
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
  registerMember(data: MemberRegistrationData): Promise<void>;
  getMemberByDiscordId(discordId: string): Promise<InternalMember | undefined>;
  getMemberByEmail(email: string): Promise<InternalMember | undefined>;
  connectDiscordAccount(data: MemberConnectionData): Promise<void>;
  getMemberList(): Promise<InternalMember[]>;
  updateMemberNickname(data: MemberNicknameUpdateData): Promise<void>;
}
