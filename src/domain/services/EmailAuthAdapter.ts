import { Result } from "../common/Result";
import { Email } from "../valueObjects/Email";
import { StudentNumber } from "../valueObjects/StudentNumber";
import { Department } from "../valueObjects/Department";

export interface EmailAuthAdapter {
  sendAuthEmail(
    email: Email,
    studentNumber: StudentNumber,
    department: Department
  ): Promise<Result<void, Error>>;
  
  verifyEmailAuth(email: Email): Promise<Result<boolean, Error>>;
}