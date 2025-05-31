import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

export interface AppConfig {
  discordToken: string;
  hotChannelId: string;
  postHotChannelTime: string;
  generalChannelId: string;
}

/**
 * アプリケーション設定を読み込み、必須項目を検証する
 */
export function loadConfig(): AppConfig {
  const discordToken = process.env.TOKEN;
  const hotChannelId = process.env.HOT_CHANNEL_ID;
  const postHotChannelTime = process.env.POST_HOT_CHANNEL_TIME;
  const generalChannelId = process.env.GENERAL_CHANNEL_ID;
  const systemChannelId = process.env.SYSTEM_CHANNEL_ID;

  if (!discordToken) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!hotChannelId) {
    throw new Error("Missing required environment variable: HOT_CHANNEL_ID");
  }

  if (!postHotChannelTime) {
    throw new Error(
      "Missing required environment variable: POST_HOT_CHANNEL_TIME",
    );
  }

  if (!generalChannelId) {
    throw new Error(
      "Missing required environment variable: GENERAL_CHANNEL_ID",
    );
  }

  return {
    discordToken,
    hotChannelId,
    postHotChannelTime,
    generalChannelId,
  };
}
