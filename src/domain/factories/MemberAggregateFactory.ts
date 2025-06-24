import { MemberAggregate } from "../aggregates/MemberAggregate";
import type { Result } from "../common/Result";
import { Member, type MemberProps } from "../entities/NewMember";
import type { EmailAuthAdapter } from "../services/EmailAuthAdapter";
import type { MemberAuthenticationService } from "../services/MemberAuthenticationService";
import type { NicknameGenerationService } from "../services/NicknameGenerationService";
import type { RoleAssignmentService } from "../services/RoleAssignmentService";
import type { MemberId } from "../valueObjects/ids/MemberId";

export class MemberAggregateFactory {
  constructor(
    private readonly authenticationService: MemberAuthenticationService,
    private readonly roleAssignmentService: RoleAssignmentService,
    private readonly nicknameGenerationService: NicknameGenerationService,
    private readonly emailAuthAdapter: EmailAuthAdapter,
  ) {}

  async createNew(props: MemberProps): Promise<Result<MemberAggregate, Error>> {
    return await MemberAggregate.createNewMember(
      props,
      this.authenticationService,
      this.roleAssignmentService,
      this.nicknameGenerationService,
      this.emailAuthAdapter,
    );
  }

  restore(member: Member): MemberAggregate {
    return MemberAggregate.restore(
      member,
      this.authenticationService,
      this.roleAssignmentService,
      this.nicknameGenerationService,
      this.emailAuthAdapter,
    );
  }

  restoreFromData(id: MemberId, props: MemberProps): MemberAggregate {
    const member = Member.restore(id, props);
    return this.restore(member);
  }
}
