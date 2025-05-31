import Department from "../../domain/entities/department";
import type AuthData from "../../domain/types/authData";
import logger from "../../infrastructure/logger";
import handleMemberRegistration from "./authController";
import { verifyMemberCredentials } from "./verifyMemberCredentials";

/**
 * DM認証フローを処理するUsecase
 * Discord.jsに依存せず、純粋なビジネスロジックのみを扱う
 */
export async function handleDMAuthFlow(
  userId: string,
  messageContent: string,
  userStates: Map<string, AuthData>,
  replyFunction: (message: string) => Promise<void>
): Promise<void> {
  const content = messageContent.trim();

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
      await replyFunction("名前(フルネーム)を教えてください");
      return;
    }

    // 段階的に情報を収集
    if (!userState.name) {
      userState.name = content;
      await replyFunction("学籍番号を教えてください");
    } else if (!userState.student_number) {
      // 学籍番号の形式検証
      if (!/^[a-zA-Z0-9]{8}$/.test(content)) {
        await replyFunction("学籍番号の形式が正しくありません。8文字の英数字で入力してください。");
        return;
      }
      userState.student_number = content;
      await replyFunction("学科を教えてください（CS, IA, BI, GRADUATE, OTHERS, OBOG）");
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
        await replyFunction("メールアドレス（静大のもの）を教えてください");
      } else {
        await replyFunction("無効な学科です。CS, IA, BI, GRADUATE, OTHERS, OBOG のいずれかを入力してください");
      }
    } else if (!userState.mail) {
      // メールアドレスの形式検証
      if (!content.endsWith("@shizuoka.ac.jp")) {
        await replyFunction("静岡大学のメールアドレス（@shizuoka.ac.jpで終わる）を入力してください。");
        return;
      }

      userState.mail = content;

      // 全情報が揃ったので認証処理を実行
      const isAuthenticated = await verifyMemberCredentials(userState);

      if (isAuthenticated) {
        try {
          await handleMemberRegistration(userState);
          await replyFunction("認証メールを送信しました。メールを確認して認証を完了してください。");
          logger.info(`Authentication process started for user: ${userId}`);
        } catch (error) {
          await replyFunction("認証に失敗しました。もう一度やり直してください。");
          await replyFunction("名前(フルネーム)を教えてください");
          userStates.set(userId, createEmptyAuthData(userId));
          return;
        }
      } else {
        await replyFunction("認証に失敗しました。入力した情報を確認してください。");
        await replyFunction("名前(フルネーム)を教えてください");
        userStates.set(userId, createEmptyAuthData(userId));
        logger.warn(`Authentication failed for user: ${userId}`);
        return;
      }

      // 認証完了後は状態をクリア
      userStates.delete(userId);
    }
  } catch (error) {
    logger.error(`Error in DM auth flow for user ${userId}:`, error);
    await replyFunction("エラーが発生しました。もう一度お試しください。");
    userStates.delete(userId);
  }
}

/**
 * 空の認証データを作成する
 */
function createEmptyAuthData(userId: string): AuthData {
  return {
    discordId: userId,
    name: undefined,
    student_number: undefined,
    department: undefined,
    mail: undefined,
  };
}
