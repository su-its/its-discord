import { Result, Ok, Err } from "../../../domain/common/Result";
import { UseCase } from "../../common/UseCase";
import { DiscordId } from "../../../domain/valueObjects/ids/DiscordId";

export interface HandleMemberJoinRequest {
  discordId: string;
  guildId: string;
}

export interface HandleMemberJoinResponse {
  action: "ASSIGN_UNAUTHORIZED_ROLE" | "MEMBER_ALREADY_REGISTERED";
  message: string;
}

export class HandleMemberJoinUseCase implements UseCase<HandleMemberJoinRequest, HandleMemberJoinResponse> {

  async execute(request: HandleMemberJoinRequest): Promise<Result<HandleMemberJoinResponse, Error>> {
    try {
      // Discord ID の検証
      const discordIdResult = DiscordId.create(request.discordId);
      if (discordIdResult.isFailure()) {
        return Err(discordIdResult.getError());
      }

      // 新規参加メンバーには未認証ロールを付与する
      // 実際のロール付与はイベントハンドラーで実行される
      return Ok({
        action: "ASSIGN_UNAUTHORIZED_ROLE",
        message: `新規メンバーが参加しました。未認証ロールを付与します。Discord ID: ${request.discordId}`
      });

    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Handle member join failed"));
    }
  }
}