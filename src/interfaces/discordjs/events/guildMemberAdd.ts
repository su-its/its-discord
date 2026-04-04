import { Events, type GuildMember } from "discord.js";
import type { AppDeps } from "../../../application/ports/deps";
import { handleNewMemberJoined } from "../../../application/usecases/handleNewMemberJoined";
import type { CustomClient } from "../../../domain/types/customClient";
import logger from "../../../infrastructure/logger";

/**
 * GuildMemberAdd イベントハンドラを設定する。
 * 新規メンバーが参加した際の初期化処理のエントリポイント。
 */
export function setupGuildMemberAddHandler(
  client: CustomClient,
  deps: AppDeps,
): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    logger.info(`New member joined: ${member.displayName} (${member.id})`);
    await handleNewMemberJoined(
      member.guild.id,
      member.id,
      member.displayName,
      deps,
    );
  });
}
