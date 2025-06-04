import Department from "../../domain/entities/department";
import type AuthData from "../../domain/types/authData";
import logger from "../../infrastructure/logger";
import handleMemberRegistration from "./authController";
import { verifyMemberCredentials } from "./verifyMemberCredentials";

interface ProcessDMAuthenticationResult {
  success: boolean;
  message: string;
}

/**
 * DM認証を処理するUsecase
 * 全ての認証情報をバリデーションし、有効であれば認証メールを送信する
 */
export async function processDMAuthentication(
  discordId: string,
  name: string,
  studentNumber: string,
  department: string,
  email: string,
): Promise<ProcessDMAuthenticationResult> {
  try {
    // バリデーション
    const validationResult = validateAuthData(name, studentNumber, department, email);
    if (!validationResult.valid) {
      return {
        success: false,
        message: `❌ **入力エラー**\n\n${validationResult.errors.join('\n')}`,
      };
    }

    // AuthDataオブジェクトを作成
    const authData: AuthData = {
      discordId,
      name: name.trim(),
      student_number: studentNumber,
      department: department as Department,
      mail: email,
    };

    // 認証情報を表示
    const confirmationMessage = `**入力された認証情報**

📝 **名前**: ${authData.name}
🎓 **学籍番号**: ${authData.student_number}
🏫 **学科**: ${authData.department}
📧 **メールアドレス**: ${authData.mail}

認証処理を実行しています...`;

    // 認証処理を実行
    const isAuthenticated = await verifyMemberCredentials(authData);

    if (!isAuthenticated) {
      logger.warn(`Authentication failed for user: ${discordId}`);
      return {
        success: false,
        message: `${confirmationMessage}\n\n❌ **認証に失敗しました。**\n\n入力した情報がITSCoreに登録されているデータと一致しません。\n正しい情報を入力してください。`,
      };
    }

    try {
      await handleMemberRegistration(authData);
      logger.info(`Authentication process started for user: ${discordId}`);

      return {
        success: true,
        message: `${confirmationMessage}\n\n✅ **認証メールを送信しました！**\n\nメールを確認して認証を完了してください。\n認証が完了したら、サーバー内で \`/auth\` コマンドを実行してロールを取得してください。`,
      };
    } catch (error) {
      logger.error(`Member registration failed for user: ${discordId}:`, error);
      return {
        success: false,
        message: `${confirmationMessage}\n\n❌ **認証メール送信に失敗しました。**\n\n管理者にお問い合わせください。`,
      };
    }
  } catch (error) {
    logger.error(`Error processing DM authentication for user ${discordId}:`, error);
    return {
      success: false,
      message: "認証処理中にエラーが発生しました。管理者にお問い合わせください。",
    };
  }
}

/**
 * 認証データのバリデーション
 */
function validateAuthData(
  name: string,
  studentNumber: string,
  department: string,
  email: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 名前のバリデーション
  if (!name || name.trim().length === 0) {
    errors.push("• 名前が入力されていません");
  }

  // 学籍番号のバリデーション
  if (!/^[a-zA-Z0-9]{8}$/.test(studentNumber)) {
    errors.push("• 学籍番号は8文字の英数字で入力してください");
  }

  // 学科のバリデーション
  const validDepartments = [
    Department.CS,
    Department.IA,
    Department.BI,
    Department.GRADUATE,
    Department.OTHERS,
    Department.OBOG,
  ];
  if (!validDepartments.includes(department as Department)) {
    errors.push("• 無効な学科が選択されています");
  }

  // メールアドレスのバリデーション
  if (!email.endsWith("@shizuoka.ac.jp")) {
    errors.push("• メールアドレスは @shizuoka.ac.jp で終わる必要があります");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}