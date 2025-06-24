import { Result } from "../common/Result";
import { MemberAggregate } from "../aggregates/MemberAggregate";
import { Member, MemberProps } from "../entities/NewMember";
import { MemberId } from "../valueObjects/ids/MemberId";
import { MemberAuthenticationService } from "../services/MemberAuthenticationService";
import { RoleAssignmentService } from "../services/RoleAssignmentService";
import { NicknameGenerationService } from "../services/NicknameGenerationService";
import { EmailAuthAdapter } from "../services/EmailAuthAdapter";

export class MemberAggregateFactory {
  constructor(
    private readonly authenticationService: MemberAuthenticationService,
    private readonly roleAssignmentService: RoleAssignmentService,
    private readonly nicknameGenerationService: NicknameGenerationService,
    private readonly emailAuthAdapter: EmailAuthAdapter
  ) {}

  async createNew(props: MemberProps): Promise<Result<MemberAggregate, Error>> {
    return await MemberAggregate.createNewMember(
      props,
      this.authenticationService,
      this.roleAssignmentService,
      this.nicknameGenerationService,
      this.emailAuthAdapter
    );
  }

  restore(member: Member): MemberAggregate {
    return MemberAggregate.restore(
      member,
      this.authenticationService,
      this.roleAssignmentService,
      this.nicknameGenerationService,
      this.emailAuthAdapter
    );
  }

  restoreFromData(
    id: MemberId,
    props: MemberProps
  ): MemberAggregate {
    const member = Member.restore(id, props);
    return this.restore(member);
  }
}