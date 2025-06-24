import { Result, Ok, Err } from "../../../domain/common/Result";
import { UseCase } from "../../common/UseCase";
import { EventDispatcher } from "../../common/DomainEventHandler";
import { MemberAggregateFactory } from "../../../domain/factories/MemberAggregateFactory";
import { MemberRepository } from "../../../domain/repositories/MemberRepository";
import { DiscordId } from "../../../domain/valueObjects/ids/DiscordId";

export interface AuthenticateMemberRequest {
  discordId: string;
}

export interface AuthenticateMemberResponse {
  memberId: string;
  memberName: string;
  department: string;
  assignedRoles: string[];
  nickname: string | null;
  message: string;
}

export class AuthenticateMemberUseCase implements UseCase<AuthenticateMemberRequest, AuthenticateMemberResponse> {
  constructor(
    private readonly memberAggregateFactory: MemberAggregateFactory,
    private readonly memberRepository: MemberRepository,
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async execute(request: AuthenticateMemberRequest): Promise<Result<AuthenticateMemberResponse, Error>> {
    try {
      // Discord ID の検証
      const discordIdResult = DiscordId.create(request.discordId);
      if (discordIdResult.isFailure()) {
        return Err(discordIdResult.getError());
      }

      // メンバー取得
      const memberResult = await this.memberRepository.findByDiscordId(discordIdResult.getValue());
      if (memberResult.isFailure()) {
        return Err(memberResult.getError());
      }

      const member = memberResult.getValue();
      if (!member) {
        return Err(new Error("Member not found. Please register first."));
      }

      // 集約の復元
      const memberAggregate = this.memberAggregateFactory.restore(member);

      // 認証実行
      const authenticationResult = await memberAggregate.completeAuthentication();
      if (authenticationResult.isFailure()) {
        return Err(authenticationResult.getError());
      }

      // 永続化
      const saveResult = await this.memberRepository.save(memberAggregate.getMember());
      if (saveResult.isFailure()) {
        return Err(saveResult.getError());
      }

      // ドメインイベント発行
      const events = authenticationResult.getValue();
      await this.eventDispatcher.dispatch(events);

      // イベントクリア
      memberAggregate.clearEvents();

      const authenticatedMember = memberAggregate.getMember();
      const discordProfile = authenticatedMember.discordProfile;

      return Ok({
        memberId: authenticatedMember.id.toValue(),
        memberName: authenticatedMember.name,
        department: authenticatedMember.department.getValue(),
        assignedRoles: discordProfile ? Array.from(discordProfile.roles) : [],
        nickname: discordProfile?.nickname || null,
        message: "認証が完了しました。ロールとニックネームが設定されました。"
      });

    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Authentication failed"));
    }
  }
}