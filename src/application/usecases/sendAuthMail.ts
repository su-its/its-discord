import logger from "../../infrastructure/logger";
import type { EmailVerificationOptions } from "../ports/emailAuthPort";
import { emailAuthService } from "../services/emailAuthService";

async function sendAuthMail(
  mail: string,
  student_number: string,
  department: string,
  redirectUrl: string,
) {
  try {
    const actionCodeSettings: EmailVerificationOptions = {
      url: redirectUrl,
      handleCodeInApp: true,
    };

    // ユーザーを作成
    const user = await emailAuthService.createUserWithEmailAndPassword({
      email: mail,
      password: student_number + department,
    });

    // 作成直後にメール認証を送信
    await emailAuthService.sendEmailVerification(user, actionCodeSettings);

    logger.info(`Authentication mail sent to ${mail} successfully`);
  } catch (error) {
    logger.error(`Failed to send authentication mail to ${mail}:`, error);
    throw error;
  }
}

export default sendAuthMail;
