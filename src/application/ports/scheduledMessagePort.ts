import type {
  ScheduledMessage,
  ScheduledMessageCreate,
} from "../../domain/entities/scheduledMessage";

/**
 * スケジュールメッセージ管理を抽象化するPort（簡素版）
 */
export interface ScheduledMessagePort {
  /**
   * スケジュールメッセージを作成する
   */
  create(message: ScheduledMessageCreate): Promise<ScheduledMessage>;

  /**
   * IDを指定してスケジュールメッセージを作成する
   * 設定ファイルからの初期化で使用
   */
  createWithId(
    id: string,
    message: ScheduledMessageCreate,
  ): Promise<ScheduledMessage>;

  /**
   * すべてのアクティブなスケジュールメッセージを取得する
   */
  getAllActive(): Promise<ScheduledMessage[]>;

  /**
   * 最後の実行時刻を更新する
   */
  updateLastExecuted(id: string, timestamp: Date): Promise<void>;
}
