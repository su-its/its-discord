export interface Embed {
  title: string;
  description: string;
  color: number;
  thumbnail?: { url: string };
  image?: { url: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; iconURL?: string };
  timestamp?: string;
}

export type MessageContent =
  | string // 静的テキストメッセージ
  | (() => Promise<string>) // 動的テキスト生成関数
  | (() => Promise<Embed>); // Embedデータ生成関数

export interface ScheduledMessage {
  id: string;
  channelId: string;
  messageContent: MessageContent;
  cronSchedule: string;
  isActive: boolean;
  createdAt: Date;
  lastExecutedAt?: Date;
}

export interface ScheduledMessageCreate {
  channelId: string;
  messageContent: MessageContent;
  cronSchedule: string;
}
