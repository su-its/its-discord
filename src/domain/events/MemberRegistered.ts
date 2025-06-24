import { DomainEvent } from "../common/DomainEvent";
import { MemberId } from "../valueObjects/ids/MemberId";
import { StudentNumber } from "../valueObjects/StudentNumber";
import { Email } from "../valueObjects/Email";
import { Department } from "../valueObjects/Department";

export class MemberRegistered extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly name: string,
    public readonly studentNumber: StudentNumber,
    public readonly email: Email,
    public readonly department: Department
  ) {
    super();
  }

  getEventName(): string {
    return "MemberRegistered";
  }
}