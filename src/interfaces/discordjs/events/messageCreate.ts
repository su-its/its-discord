import { ChannelType, Events, type Message } from "discord.js";
import type { CustomClient } from "../../../domain/types/customClient";

export function setupMessageCreate(
  client: CustomClient,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userStates: Map<string, unknown>, // レガシー用途のため維持（削除予定）
) {
  client.on(Events.MessageCreate, async (message: Message) => {
    // BOTからのメッセージとDM以外は無視
    if (message.author.bot || message.channel.type !== ChannelType.DM) return;

    // 古いDM認証フローは廃止されました
    // 新しいコマンドベースの認証フローを使用してください

    await message.reply(`**認証フローが新しくなりました！**

以下のコマンドを使用してください：

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

認証メール送信後、サーバー内で \`/auth\` コマンドで最終認証を行ってください。`);
  });
}
