import type { DomainEvent } from "../../../domain/common/DomainEvent";
import { Err, Ok, type Result } from "../../../domain/common/Result";
import type { MemberAggregateFactory } from "../../../domain/factories/MemberAggregateFactory";
import type { MemberRepository } from "../../../domain/repositories/MemberRepository";
import type { ITSCoreAdapter } from "../../../domain/services/ITSCoreAdapter";
import { DiscordId } from "../../../domain/valueObjects/ids/DiscordId";
import type { EventDispatcher } from "../../common/DomainEventHandler";
import type { UseCase } from "../../common/UseCase";

export interface RenameAllMembersRequest {
  guildId: string;
}

export interface RenameAllMembersResponse {
  successCount: number;
  failureCount: number;
  failedMemberIds: string[];
  message: string;
}

export class RenameAllMembersUseCase
  implements UseCase<RenameAllMembersRequest, RenameAllMembersResponse>
{
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberAggregateFactory: MemberAggregateFactory,
    private readonly itsCoreAdapter: ITSCoreAdapter,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(
    request: RenameAllMembersRequest,
  ): Promise<Result<RenameAllMembersResponse, Error>> {
    try {
      // 1. ITSCoreから全メンバー情報を取得
      const itsCoreResult = await this.itsCoreAdapter.getAllMembers();
      if (itsCoreResult.isFailure()) {
        return Err(
          new Error(
            `Failed to fetch members from ITSCore: ${itsCoreResult.getError().message}`,
          ),
        );
      }

      const itsCoreMembers = itsCoreResult.getValue();
      const membersWithDiscordId = itsCoreMembers.filter(
        (member) => member.discordId,
      );

      let successCount = 0;
      let failureCount = 0;
      const failedMemberIds: string[] = [];
      const allEvents: DomainEvent[] = [];

      // 2. 各メンバーのニックネーム更新を並列実行
      const updatePromises = membersWithDiscordId.map(async (itsMember) => {
        try {
          // ドメインエンティティとして復元
          const member = await this.findMemberByDiscordId(itsMember.discordId!);
          if (!member) {
            failureCount++;
            failedMemberIds.push(itsMember.discordId!);
            return;
          }

          // メンバー集約を復元
          const memberAggregate = this.memberAggregateFactory.restore(member);

          // ニックネーム更新（ITSCoreのニックネームを使用）
          const updateResult = memberAggregate.updateNickname(
            itsMember.discordNickname || "",
          );
          if (updateResult.isFailure()) {
            failureCount++;
            failedMemberIds.push(itsMember.discordId!);
            return;
          }

          // 永続化
          const saveResult = await this.memberRepository.save(
            memberAggregate.getMember(),
          );
          if (saveResult.isFailure()) {
            failureCount++;
            failedMemberIds.push(itsMember.discordId!);
            return;
          }

          // イベント収集（並列処理なので後でまとめて発行）
          const events = updateResult.getValue();
          allEvents.push(...events);
          memberAggregate.clearEvents();

          successCount++;
        } catch (error) {
          failureCount++;
          failedMemberIds.push(itsMember.discordId!);
        }
      });

      await Promise.all(updatePromises);

      // 3. 全てのドメインイベントを一括発行
      if (allEvents.length > 0) {
        await this.eventDispatcher.dispatch(allEvents);
      }

      const message = `ニックネームの一括変更が完了しました。成功: ${successCount}件、失敗: ${failureCount}件`;

      return Ok({
        successCount,
        failureCount,
        failedMemberIds,
        message,
      });
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Bulk rename failed"),
      );
    }
  }

  private async findMemberByDiscordId(discordId: string) {
    try {
      const discordIdVO = DiscordId.create(discordId);
      if (discordIdVO.isFailure()) {
        return null;
      }

      const memberResult = await this.memberRepository.findByDiscordId(
        discordIdVO.getValue(),
      );
      if (memberResult.isFailure()) {
        return null;
      }

      return memberResult.getValue();
    } catch {
      return null;
    }
  }
}
