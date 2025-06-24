import type { Result } from "../common/Result";
import type { Department } from "../valueObjects/Department";
import type { Email } from "../valueObjects/Email";
import type { StudentNumber } from "../valueObjects/StudentNumber";

export interface EmailAuthAdapter {
  sendAuthEmail(
    email: Email,
    studentNumber: StudentNumber,
    department: Department,
  ): Promise<Result<void, Error>>;

  verifyEmailAuth(email: Email): Promise<Result<boolean, Error>>;
}
