/**
 * Discord Channel関連の型
 */
export interface DiscordChannel {
  id: string;
  name: string;
}

/**
 * Discord Channel操作を抽象化するPort
 * チャンネル管理に関する操作のみを定義
 */
export interface DiscordChannelPort {
  /**
   * 指定されたギルドのテキストチャンネル一覧を取得する
   */
  getTextChannels(guildId: string): Promise<DiscordChannel[]>;

  /**
   * 指定されたチャンネルの過去1ヶ月間のメッセージ数を取得する
   */
  getChannelMessageCount(channelId: string): Promise<number>;

  /**
   * 指定されたチャンネルにEmbedメッセージを送信する
   */
  sendEmbedToChannel(
    channelId: string,
    embed: {
      title: string;
      description: string;
      color: number;
      thumbnail?: { url: string };
      image?: { url: string };
      fields?: { name: string; value: string; inline?: boolean }[];
      footer?: { text: string; iconURL?: string };
      timestamp?: string;
    },
  ): Promise<void>;
}
