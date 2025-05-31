export interface ScheduledMessage {
  id: string;
  channelId: string;
  message: string;
  cronSchedule: string;
  isActive: boolean;
  createdAt: Date;
  lastExecutedAt?: Date;
}

export interface ScheduledMessageCreate {
  channelId: string;
  message: string;
  cronSchedule: string;
}
