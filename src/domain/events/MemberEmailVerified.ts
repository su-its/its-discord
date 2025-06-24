import { DomainEvent } from "../common/DomainEvent";
import type { Email } from "../valueObjects/Email";
import type { MemberId } from "../valueObjects/ids/MemberId";

export class MemberEmailVerified extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly email: Email,
  ) {
    super();
  }

  getEventName(): string {
    return "MemberEmailVerified";
  }
}
