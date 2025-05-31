/**
 * Discord Message操作を抽象化するPort
 * メッセージ送信に関する操作のみを定義
 */
export interface DiscordMessagePort {
  /**
   * ユーザーにダイレクトメッセージを送信する
   */
  sendDirectMessage(userId: string, message: string): Promise<void>;
}
