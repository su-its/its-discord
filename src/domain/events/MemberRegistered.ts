import { DomainEvent } from "../common/DomainEvent";
import type { Department } from "../valueObjects/Department";
import type { Email } from "../valueObjects/Email";
import type { StudentNumber } from "../valueObjects/StudentNumber";
import type { MemberId } from "../valueObjects/ids/MemberId";

export class MemberRegistered extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly name: string,
    public readonly studentNumber: StudentNumber,
    public readonly email: Email,
    public readonly department: Department,
  ) {
    super();
  }

  getEventName(): string {
    return "MemberRegistered";
  }
}
