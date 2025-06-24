import { Result, Ok } from "../../../../../domain/common/Result";
import { MemberAggregateFactory } from "../../../../../domain/factories/MemberAggregateFactory";
import { MemberAggregate } from "../../../../../domain/aggregates/MemberAggregate";
import { Member, MemberProps } from "../../../../../domain/entities/NewMember";
import { MemberId } from "../../../../../domain/valueObjects/ids/MemberId";
import { MemberAuthenticationService } from "../../../../../domain/services/MemberAuthenticationService";
import { RoleAssignmentService } from "../../../../../domain/services/RoleAssignmentService";
import { NicknameGenerationService } from "../../../../../domain/services/NicknameGenerationService";
import { EmailAuthAdapter } from "../../../../../domain/services/EmailAuthAdapter";

export class MockMemberAggregateFactory extends MemberAggregateFactory {
  public createNewCallCount = 0;
  public restoreCallCount = 0;

  constructor(
    authenticationService: MemberAuthenticationService,
    roleAssignmentService: RoleAssignmentService,
    nicknameGenerationService: NicknameGenerationService,
    emailAuthAdapter: EmailAuthAdapter
  ) {
    super(authenticationService, roleAssignmentService, nicknameGenerationService, emailAuthAdapter);
  }

  async createNew(props: MemberProps): Promise<Result<MemberAggregate, Error>> {
    this.createNewCallCount++;
    return super.createNew(props);
  }

  restore(member: Member): MemberAggregate {
    this.restoreCallCount++;
    return super.restore(member);
  }

  restoreFromData(id: MemberId, props: MemberProps): MemberAggregate {
    this.restoreCallCount++;
    return super.restoreFromData(id, props);
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.createNewCallCount = 0;
    this.restoreCallCount = 0;
  }
}