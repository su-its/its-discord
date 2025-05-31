import { discordServerService } from "../services/discordServerService";
import type { GuildMember } from "discord.js";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import logger from "../../infrastructure/logger";

/**
 * 新規ギルドメンバーの処理を行う
 * 未承認ロールを付与し、ウェルカムDMを送信する
 * @param member 新規参加したメンバー
 */
export async function handleNewGuildMember(member: GuildMember): Promise<void> {
  try {
    // 未承認ロールを付与
    const unAuthorizedRole = roleRegistry.getRole(roleRegistryKeys.unAuthorizedRoleKey);
    await discordServerService.addRoleToMember(member.guild.id, member.id, unAuthorizedRole);

    // ウェルカムDMを送信
    const welcomeMessage = `
こんにちは！ITSサーバーへようこそ！

認証を行うために、以下の情報をDMで送信してください：
1. お名前
2. 学籍番号
3. 学科
4. メールアドレス（静大のもの）

認証が完了すると、サーバーの全機能をご利用いただけます。
    `;

    await member.send(welcomeMessage);
    logger.info(`Welcome DM sent to ${member.displayName} (${member.id})`);
  } catch (error) {
    logger.error(`Failed to handle new guild member ${member.displayName} (${member.id}):`, error);
    throw error;
  }
}
