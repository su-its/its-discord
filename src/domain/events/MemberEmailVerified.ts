import { DomainEvent } from "../common/DomainEvent";
import { MemberId } from "../valueObjects/ids/MemberId";
import { Email } from "../valueObjects/Email";

export class MemberEmailVerified extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly email: Email
  ) {
    super();
  }

  getEventName(): string {
    return "MemberEmailVerified";
  }
}