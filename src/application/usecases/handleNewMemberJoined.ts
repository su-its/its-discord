import roleRegistry from "../../domain/types/roles";
import { unAuthorizedRoleKey } from "../../domain/types/roles/implementations/unAuthorized";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";

/**
 * 新規メンバーが参加した際の初期化処理を行うUsecase
 * ウェルカムDMの送信と未承認ロールの付与を実行する
 */
export async function handleNewMemberJoined(
  guildId: string,
  memberId: string,
  memberDisplayName: string,
): Promise<void> {
  try {
    // ウェルカムDMを送信
    const welcomeMessage = `ようこそ ${memberDisplayName} さん！ ITSサーバーへようこそ！

**認証を行うために以下のコマンドを実行してください：**

\`/auth_dm name:あなたの名前 student_number:学籍番号 department:学科 email:メールアドレス\`

**使用例:**
\`/auth_dm name:山田太郎 student_number:12345678 department:CS email:yamada@shizuoka.ac.jp\`

**学科の選択肢:**
• CS - 情報科学科
• BI - 行動情報学科  
• IA - 情報社会学科
• GRADUATE - 大学院生
• OTHERS - その他
• OBOG - OB/OG

認証が完了すると、サーバーの全機能をご利用いただけます。
質問がある場合は管理者にお尋ねください。`;

    await discordServerService.sendDirectMessage(memberId, welcomeMessage);
    logger.info(`Sent welcome DM to ${memberDisplayName} (${memberId})`);

    // 未承認ロールを付与
    const role = roleRegistry.getRole(unAuthorizedRoleKey);
    await discordServerService.addRoleToMember(guildId, memberId, role);
    logger.info(
      `Assigned Unauthorized role (${role.name}) to ${memberDisplayName} (${memberId})`,
    );
  } catch (error) {
    logger.error(
      `Failed to handle new member ${memberDisplayName} (${memberId}):`,
      error,
    );
    throw error;
  }
}
