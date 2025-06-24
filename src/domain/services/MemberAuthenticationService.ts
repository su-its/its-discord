import { Result, Ok, Err } from "../common/Result";
import { StudentNumber } from "../valueObjects/StudentNumber";
import { Email } from "../valueObjects/Email";
import { Department } from "../valueObjects/Department";
import { ITSCoreAdapter, MemberCredentials } from "./ITSCoreAdapter";

export class MemberAuthenticationService {
  constructor(
    private readonly itsCoreAdapter: ITSCoreAdapter
  ) {}

  async verifyMemberCredentials(
    name: string,
    studentNumber: StudentNumber,
    email: Email,
    department: Department
  ): Promise<Result<boolean, Error>> {
    try {
      const credentials: MemberCredentials = {
        name,
        studentNumber,
        email,
        department
      };

      const result = await this.itsCoreAdapter.findMember(credentials);
      
      if (result.isFailure()) {
        return Err(result.getError());
      }

      const itsMember = result.getValue();
      if (!itsMember) {
        return Ok(false);
      }

      // 厳密な照合
      const isValid = 
        itsMember.name === name &&
        itsMember.studentNumber === studentNumber.getValue() &&
        itsMember.email === email.getValue() &&
        itsMember.department === department.getValue();

      return Ok(isValid);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
    }
  }
}