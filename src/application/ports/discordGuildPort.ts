import type Role from "../../domain/types/role";

/**
 * Discord Guild操作を抽象化するPort
 * ギルドとロール管理に関する操作のみを定義
 */
export interface DiscordGuildPort {
  /**
   * Botが参加している最初のギルドを取得する
   */
  getFirstGuild(): Promise<string>;

  /**
   * 指定されたロールが存在することを確認し、なければ作成する
   */
  ensureRoleExists(guildId: string, role: Role): Promise<void>;
}
