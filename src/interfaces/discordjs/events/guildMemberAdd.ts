import { Events, type GuildMember } from "discord.js";
import { DIContainer } from "../../../application/services/DIContainer";
import type { CustomClient } from "../../../domain/types/customClient";
import logger from "../../../infrastructure/logger";

/**
 * GuildMemberAdd イベントハンドラを設定する。
 * 新規メンバーが参加した際の初期化処理のエントリポイント。
 */
export function setupGuildMemberAddHandler(client: CustomClient): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    logger.info(`New member joined: ${member.displayName} (${member.id})`);

    try {
      const diContainer = DIContainer.getInstance();
      const handleMemberJoinUseCase = diContainer.getHandleMemberJoinUseCase();

      const result = await handleMemberJoinUseCase.execute({
        discordId: member.id,
        guildId: member.guild.id,
        displayName: member.displayName,
      });

      if (result.isSuccess()) {
        logger.info(
          `Successfully handled new member join: ${result.getValue().message}`,
        );
      } else {
        logger.error(
          `Failed to handle new member join: ${result.getError().message}`,
        );
      }
    } catch (error) {
      logger.error(
        `Error handling new member join for ${member.displayName} (${member.id}):`,
        error,
      );
    }
  });
}
