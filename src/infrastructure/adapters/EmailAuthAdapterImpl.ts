import sendAuthMail from "../../application/usecases/sendAuthMail";
import { Err, Ok, type Result } from "../../domain/common/Result";
import type { EmailAuthAdapter } from "../../domain/services/EmailAuthAdapter";
import type { Department } from "../../domain/valueObjects/Department";
import type { Email } from "../../domain/valueObjects/Email";
import type { StudentNumber } from "../../domain/valueObjects/StudentNumber";

export class EmailAuthAdapterImpl implements EmailAuthAdapter {
  async sendAuthEmail(
    email: Email,
    studentNumber: StudentNumber,
    department: Department,
  ): Promise<Result<void, Error>> {
    try {
      await sendAuthMail(
        email.getValue(),
        studentNumber.getValue(),
        department.toString(),
      );
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Failed to send auth email"),
      );
    }
  }

  async verifyEmailAuth(email: Email): Promise<Result<boolean, Error>> {
    try {
      // Firebase Auth API を使用してメール認証状況を確認
      const { firebaseAuthService } = await import(
        "../../infrastructure/firebase"
      );
      const user = await firebaseAuthService.getUserByEmail(email.getValue());
      return Ok(user.emailVerified);
    } catch (error) {
      // ユーザーが見つからない場合は認証されていないとみなす
      if (error instanceof Error && error.message.includes("USER_NOT_FOUND")) {
        return Ok(false);
      }
      return Err(
        error instanceof Error
          ? error
          : new Error("Failed to verify email auth"),
      );
    }
  }
}
