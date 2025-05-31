import type Role from "../../domain/types/role";

/**
 * Discord Member関連の型
 */
export interface DiscordMember {
  id: string;
  displayName: string;
  nickname?: string;
}

/**
 * Discord Member操作を抽象化するPort
 * メンバー管理に関する操作のみを定義
 */
export interface DiscordMemberPort {
  /**
   * 指定されたギルドの全メンバーを取得する
   */
  getGuildMembers(guildId: string): Promise<DiscordMember[]>;

  /**
   * メンバーのニックネームを設定する
   */
  setMemberNickname(
    guildId: string,
    memberId: string,
    nickname: string,
  ): Promise<void>;

  /**
   * ロールが存在しない場合は作成し、メンバーにロールを追加する
   */
  addRoleToMember(guildId: string, memberId: string, role: Role): Promise<void>;

  /**
   * メンバーからロールを削除する
   */
  removeRoleFromMember(
    guildId: string,
    memberId: string,
    role: Role,
  ): Promise<void>;
}
