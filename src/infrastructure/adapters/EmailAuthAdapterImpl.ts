import { Result, Ok, Err } from "../../domain/common/Result";
import { EmailAuthAdapter } from "../../domain/services/EmailAuthAdapter";
import { Email } from "../../domain/valueObjects/Email";
import { StudentNumber } from "../../domain/valueObjects/StudentNumber";
import { Department } from "../../domain/valueObjects/Department";
import sendAuthMail from "../../application/usecases/sendAuthMail";

export class EmailAuthAdapterImpl implements EmailAuthAdapter {
  async sendAuthEmail(
    email: Email,
    studentNumber: StudentNumber,
    department: Department
  ): Promise<Result<void, Error>> {
    try {
      await sendAuthMail(
        email.getValue(),
        studentNumber.getValue(),
        department.toString()
      );
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to send auth email"));
    }
  }

  async verifyEmailAuth(email: Email): Promise<Result<boolean, Error>> {
    try {
      // 現在のFirebase実装では、メール認証の確認は外部で行われるため
      // ここでは常にtrueを返す（実際の実装では Firebase Auth API を使用）
      return Ok(true);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to verify email auth"));
    }
  }
}