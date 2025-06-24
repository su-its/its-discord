import type { MemberAggregate } from "../../../../../domain/aggregates/MemberAggregate";
import { Ok, type Result } from "../../../../../domain/common/Result";
import type {
  Member,
  MemberProps,
} from "../../../../../domain/entities/NewMember";
import { MemberAggregateFactory } from "../../../../../domain/factories/MemberAggregateFactory";
import type { EmailAuthAdapter } from "../../../../../domain/services/EmailAuthAdapter";
import type { MemberAuthenticationService } from "../../../../../domain/services/MemberAuthenticationService";
import type { NicknameGenerationService } from "../../../../../domain/services/NicknameGenerationService";
import type { RoleAssignmentService } from "../../../../../domain/services/RoleAssignmentService";
import type { MemberId } from "../../../../../domain/valueObjects/ids/MemberId";

export class MockMemberAggregateFactory extends MemberAggregateFactory {
  public createNewCallCount = 0;
  public restoreCallCount = 0;

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
