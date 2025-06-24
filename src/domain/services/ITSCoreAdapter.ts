import type { Result } from "../common/Result";
import type { Department } from "../valueObjects/Department";
import type { Email } from "../valueObjects/Email";
import type { StudentNumber } from "../valueObjects/StudentNumber";

export interface ITSCoreMember {
  name: string;
  studentNumber: string;
  email: string;
  department: string;
}

export interface MemberCredentials {
  name: string;
  studentNumber: StudentNumber;
  email: Email;
  department: Department;
}

export interface ITSCoreAdapter {
  findMember(
    credentials: MemberCredentials,
  ): Promise<Result<ITSCoreMember | null, Error>>;
  getAllMembers(): Promise<Result<ITSCoreMember[], Error>>;
}
