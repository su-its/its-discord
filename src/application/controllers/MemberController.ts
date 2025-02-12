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
  try {
    return await getAllMembers(memberRepository);
  } catch (error) {
    logger.error("Error getting members:", error);
    throw error;
  }
}

/**
 * メールアドレスからメンバーを取得するエンドポイント
 */
export async function getMemberByEmailController(
  email: string,
): Promise<Member | undefined> {
  try {
    const member = await getMemberByEmail(memberRepository, email);
    if (!member) {
      return undefined;
    }
    return member;
  } catch (error) {
    logger.error("Error getting member by email:", error);
    throw error;
  }
}

/**
 * Discord IDからメンバーを取得するエンドポイント
 */
export async function getMemberByDiscordIdController(
  discordId: string,
): Promise<Member | undefined> {
  try {
    const member = await getMemberByDiscordId(memberRepository, discordId);
    if (!member) {
      return undefined;
    }
    return member;
  } catch (error) {
    logger.error("Error getting member by discord id:", error);
    throw error;
  }
}

/**
 * 新規メンバー作成エンドポイント
 */
export async function addMemberController(
  input: MemberCreateInput,
): Promise<Member> {
  try {
    const member = await insertMember(memberRepository, input);
    logger.info("Member successfully added");
    return member;
  } catch (error) {
    logger.error("Error adding member:", error);
    throw error;
  }
}

/**
 * Discordアカウントをメンバーに紐付けるエンドポイント
 */
export async function addDiscordAccountController(
  memberId: string,
  discordId: string,
): Promise<Member> {
  try {
    return await connectDiscordAccount(memberRepository, memberId, discordId);
  } catch (error) {
    logger.error("Error connecting discord account:", error);
    throw error;
  }
}
