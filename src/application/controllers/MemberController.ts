import type Member from "../../domain/entities/member";
import type {
  CreateDiscordAccountInput,
  MemberCreateInput,
} from "../repository/IMemberRepository";

import connectDiscordAccount from "../usecases/member/connectDiscordAccount";
// UseCase のインポート
import getAllMembers from "../usecases/member/getAllMembers";
import getMemberByDiscordId from "../usecases/member/getMemberByDiscordId";
import getMemberByEmail from "../usecases/member/getMemberByEmail";
import insertMember from "../usecases/member/insertMember";

import logger from "../../infrastructure/logger";
import prismaClient from "../../infrastructure/prisma";
// リポジトリの実装と Prisma のインスタンス（インフラ層）
import MemberRepository from "../repository/memberRepository";

// リポジトリインスタンスの生成（DI）
const memberRepository = new MemberRepository(prismaClient);

/**
 * 全メンバー取得エンドポイント
 */
export async function getAllMembersController(): Promise<Member[]> {
  return await getAllMembers(memberRepository);
}

/**
 * メールアドレスからメンバーを取得するエンドポイント
 */
export async function getMemberByEmailController(
  email: string,
): Promise<Member | undefined> {
  const member = await getMemberByEmail(memberRepository, email);
  if (!member) {
    return undefined;
  }
  return member;
}

/**
 * Discord IDからメンバーを取得するエンドポイント
 */
export async function getMemberByDiscordIdController(
  discordId: string,
): Promise<Member | undefined> {
  const member = await getMemberByDiscordId(memberRepository, discordId);
  if (!member) {
    return undefined;
  }
  return member;
}

/**
 * 新規メンバー作成エンドポイント
 */
export async function addMemberController(
  input: MemberCreateInput,
): Promise<Member> {
  const member = await insertMember(memberRepository, input);
  return member;
}

/**
 * Discordアカウントをメンバーに紐付けるエンドポイント
 */
export async function addDiscordAccountController(
  memberId: string,
  discordId: string,
): Promise<Member> {
  return await connectDiscordAccount(memberRepository, memberId, discordId);
}
