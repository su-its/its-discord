import type { Message } from "discord.js";
import Department from "../../domain/entities/department";
import type AuthData from "../../domain/types/authData";
import logger from "../../infrastructure/logger";
import authMember from "../utils/authMember";
import handleMemberRegistration from "./authController";

/**
 * DM認証フローを処理する
 * @param message DMメッセージ
 * @param userStates ユーザーの状態管理Map
 */
export async function handleDMAuthFlow(message: Message, userStates: Map<string, AuthData>): Promise<void> {
  // BOTからのメッセージは無視
  if (message.author.bot) return;

  // DMチャンネル以外は無視
  if (message.channel.type !== 1) return; // ChannelType.DM = 1

  const userId = message.author.id;
  const content = message.content.trim();

  try {
    // ユーザーの現在の状態を取得
    let userState = userStates.get(userId);

    if (!userState) {
      // 新規ユーザーの場合、初期状態を作成
      userState = {
        discordId: userId,
        name: undefined,
        student_number: undefined,
        department: undefined,
        mail: undefined,
      };
      userStates.set(userId, userState);
      await message.reply("名前(フルネーム)を教えてください");
      return;
    }

    // 段階的に情報を収集
    if (!userState.name) {
      userState.name = content;
      await message.reply("学籍番号を教えてください");
    } else if (!userState.student_number) {
      userState.student_number = content;
      await message.reply("学科を教えてください（CS, IA, BI, GRADUATE, OTHERS, OBOG）");
    } else if (!userState.department) {
      // Department型の検証
      const validDepartments = [
        Department.CS,
        Department.IA,
        Department.BI,
        Department.GRADUATE,
        Department.OTHERS,
        Department.OBOG,
      ];
      if (validDepartments.includes(content as Department)) {
        userState.department = content as Department;
        await message.reply("メールアドレス（静大のもの）を教えてください");
      } else {
        await message.reply("無効な学科です。CS, IA, BI, GRADUATE, OTHERS, OBOG のいずれかを入力してください");
      }
    } else if (!userState.mail) {
      userState.mail = content;

      // 全情報が揃ったので認証処理を実行
      const isAuthenticated = await authMember(userState);

      if (isAuthenticated) {
        await handleMemberRegistration(userState);
        await message.reply("認証メールを送信しました。メールを確認して認証を完了してください。");
        logger.info(`Authentication process started for user: ${userId}`);
      } else {
        await message.reply("認証に失敗しました。入力した情報を確認してください。");
        logger.warn(`Authentication failed for user: ${userId}`);
      }

      // 状態をクリア
      userStates.delete(userId);
    }
  } catch (error) {
    logger.error(`Error in DM auth flow for user ${userId}:`, error);
    await message.reply("エラーが発生しました。もう一度お試しください。");
    userStates.delete(userId);
  }
}

async function setUserInfoAndReply(
  userStates: Map<string, AuthData>,
  userId: string,
  update: Partial<AuthData>,
  replyMessage: string,
  reply: (message: string) => Promise<Message>
) {
  const userInfo = userStates.get(userId) || {};
  Object.assign(userInfo, update);
  userStates.set(userId, userInfo);
  await reply(replyMessage);
}

async function validateAndSetStudentNumber(
  message: Message,
  userInfo: AuthData,
  userStates: Map<string, AuthData>,
  userId: string,
  reply: (message: string) => Promise<Message>
) {
  const studentNumber = message.content;
  if (!/^[a-zA-Z0-9]{8}$/.test(studentNumber)) {
    await reply("学籍番号の形式が正しくありません。");
    return;
  }
  await setUserInfoAndReply(
    userStates,
    userId,
    { student_number: studentNumber },
    "学科を以下から教えてください: CS, BI, IA, OTHERS",
    reply
  );
}

async function validateAndSetDepartment(
  message: Message,
  userInfo: AuthData,
  userStates: Map<string, AuthData>,
  userId: string,
  reply: (message: string) => Promise<Message>
) {
  const departmentInput = message.content.toUpperCase();
  if (departmentInput in Department) {
    await setUserInfoAndReply(
      userStates,
      userId,
      { department: Department[departmentInput as keyof typeof Department] },
      "メールアドレスを教えてください",
      reply
    );
  } else {
    await reply("形式が正しくありません。学科を以下から教えてください: CS, BI, IA, GRADUATE, OTHERS");
  }
}

async function validateAndRegisterUser(
  message: Message,
  userInfo: AuthData,
  userStates: Map<string, AuthData>,
  userId: string,
  reply: (message: string) => Promise<Message>
) {
  const mail = message.content;
  if (mail.endsWith("@shizuoka.ac.jp")) {
    const updatedUserInfo = { ...userInfo, mail };
    if (await authMember(updatedUserInfo)) {
      try {
        updatedUserInfo.discordId = message.author.id;
        await handleMemberRegistration(updatedUserInfo);
      } catch (e) {
        await reply("認証に失敗しました。もう一度やり直してください");
        await reply("名前(フルネーム)を教えてください");
        userStates.set(userId, clearAuthData());
        return;
      }
      await reply(
        "認証メールを送信しました。静大メールから認証を行い、Discordサーバーで`/auth`コマンドを実行してください"
      );
    } else {
      await reply("認証に失敗しました。もう一度やり直してください");
      await reply("名前(フルネーム)を教えてください");
      userStates.set(userId, clearAuthData());
    }
    userStates.delete(userId); // 登録後は状態をクリア
  } else {
    await reply("メールアドレスの形式が正しくありません。もう一度お願いします");
  }
}

function clearAuthData(): AuthData {
  return {
    name: undefined,
    student_number: undefined,
    department: undefined,
    mail: undefined,
    discordId: undefined,
  };
}
