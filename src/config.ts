import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

export interface AppConfig {
  discordToken: string;
  hotChannelId: string;
  postHotChannelTime: string;
}

/**
 * アプリケーション設定を読み込み、必須項目を検証する
 */
export function loadConfig(): AppConfig {
  const discordToken = process.env.TOKEN;
  const hotChannelId = process.env.HOT_CHANNEL_ID;
  const postHotChannelTime = process.env.POST_HOT_CHANNEL_TIME;

  if (!discordToken) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!hotChannelId) {
    throw new Error("Missing required environment variable: HOT_CHANNEL_ID");
  }

  if (!postHotChannelTime) {
    throw new Error("Missing required environment variable: POST_HOT_CHANNEL_TIME");
  }

  return {
    discordToken,
    hotChannelId,
    postHotChannelTime,
  };
}

/**
 * 設定の妥当性をチェックする
 */
export function validateConfig(config: AppConfig): void {
  // cron形式の検証（簡易版）
  if (
    !/^[0-9\*\-\/,]+\s+[0-9\*\-\/,]+\s+[0-9\*\-\/,]+\s+[0-9\*\-\/,]+\s+[0-9\*\-\/,]+$/.test(config.postHotChannelTime)
  ) {
    throw new Error("Invalid cron format for POST_HOT_CHANNEL_TIME");
  }

  // Discord Token の基本検証
  if (config.discordToken.length < 50) {
    throw new Error("Discord token appears to be invalid (too short)");
  }

  // Channel ID の基本検証
  if (!/^[0-9]{17,20}$/.test(config.hotChannelId)) {
    throw new Error("Hot channel ID appears to be invalid format");
  }
}
