import { Err, Ok, type Result } from "../../../domain/common/Result";
import type { MemberAggregateFactory } from "../../../domain/factories/MemberAggregateFactory";
import type { MemberRepository } from "../../../domain/repositories/MemberRepository";
import { DiscordId } from "../../../domain/valueObjects/ids/DiscordId";
import type { EventDispatcher } from "../../common/DomainEventHandler";
import type { UseCase } from "../../common/UseCase";

export interface UpdateMemberNicknameRequest {
  discordId: string;
  newNickname: string;
}

export interface UpdateMemberNicknameResponse {
  memberId: string;
  oldNickname: string | null;
  newNickname: string;
  message: string;
}

export class UpdateMemberNicknameUseCase
  implements UseCase<UpdateMemberNicknameRequest, UpdateMemberNicknameResponse>
{
  constructor(
    private readonly memberAggregateFactory: MemberAggregateFactory,
    private readonly memberRepository: MemberRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(
    request: UpdateMemberNicknameRequest,
  ): Promise<Result<UpdateMemberNicknameResponse, Error>> {
    try {
      // Discord ID の検証
      const discordIdResult = DiscordId.create(request.discordId);
      if (discordIdResult.isFailure()) {
        return Err(discordIdResult.getError());
      }

      // メンバー取得
      const memberResult = await this.memberRepository.findByDiscordId(
        discordIdResult.getValue(),
      );
      if (memberResult.isFailure()) {
        return Err(memberResult.getError());
      }

      const member = memberResult.getValue();
      if (!member) {
        return Err(new Error("Member not found"));
      }

      // 認証状態チェック
      if (!member.status.isAuthenticated()) {
        return Err(
          new Error("Member must be authenticated to update nickname"),
        );
      }

      // 集約の復元
      const memberAggregate = this.memberAggregateFactory.restore(member);

      // 現在のニックネームを保存
      const oldNickname = member.discordProfile?.nickname || null;

      // ニックネーム更新
      const updateResult = memberAggregate.updateNickname(request.newNickname);
      if (updateResult.isFailure()) {
        return Err(updateResult.getError());
      }

      // 永続化
      const saveResult = await this.memberRepository.save(
        memberAggregate.getMember(),
      );
      if (saveResult.isFailure()) {
        return Err(saveResult.getError());
      }

      // ドメインイベント発行
      const events = updateResult.getValue();
      await this.eventDispatcher.dispatch(events);

      // イベントクリア
      memberAggregate.clearEvents();

      return Ok({
        memberId: member.id.toValue(),
        oldNickname,
        newNickname: request.newNickname,
        message: "ニックネームが更新されました。",
      });
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Nickname update failed"),
      );
    }
  }
}
