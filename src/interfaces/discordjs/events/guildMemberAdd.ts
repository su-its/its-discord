import type { AppDeps } from "@application/ports";
import { handleNewMemberJoined } from "@application/usecases";
import type { CustomClient } from "@domain/types";
import logger from "@infrastructure/logger";
import { Events, type GuildMember } from "discord.js";

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
