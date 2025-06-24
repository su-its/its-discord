import { Err, Ok, type Result } from "../../../domain/common/Result";
import { MemberJoinedGuildEvent } from "../../../domain/events/MemberJoinedGuildEvent";
import { DiscordId } from "../../../domain/valueObjects/ids/DiscordId";
import type { EventDispatcher } from "../../common/DomainEventHandler";
import type { UseCase } from "../../common/UseCase";

export interface HandleMemberJoinRequest {
  discordId: string;
  guildId: string;
  displayName: string;
}

export interface HandleMemberJoinResponse {
  action: "ASSIGN_UNAUTHORIZED_ROLE" | "MEMBER_ALREADY_REGISTERED";
  message: string;
}

export class HandleMemberJoinUseCase
  implements UseCase<HandleMemberJoinRequest, HandleMemberJoinResponse>
{
  constructor(private readonly eventDispatcher: EventDispatcher) {}

  async execute(
    request: HandleMemberJoinRequest,
  ): Promise<Result<HandleMemberJoinResponse, Error>> {
    try {
      // Discord ID の検証
      const discordIdResult = DiscordId.create(request.discordId);
      if (discordIdResult.isFailure()) {
        return Err(discordIdResult.getError());
      }

      // ドメインイベント発行
      const memberJoinedEvent = new MemberJoinedGuildEvent(
        discordIdResult.getValue(),
        request.guildId,
        request.displayName,
      );

      await this.eventDispatcher.dispatch([memberJoinedEvent]);

      return Ok({
        action: "ASSIGN_UNAUTHORIZED_ROLE",
        message:
          "新規メンバーが参加しました。ウェルカムメッセージと未認証ロールを設定します。",
      });
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Handle member join failed"),
      );
    }
  }
}
