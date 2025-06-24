import { Result } from "../common/Result";
import { StudentNumber } from "../valueObjects/StudentNumber";
import { Email } from "../valueObjects/Email";
import { Department } from "../valueObjects/Department";

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
  findMember(credentials: MemberCredentials): Promise<Result<ITSCoreMember | null, Error>>;
  getAllMembers(): Promise<Result<ITSCoreMember[], Error>>;
}