import { Entity } from "../common/Entity";
import { Result, Ok, Err } from "../common/Result";
import { ScheduledMessageId } from "../valueObjects/ids/ScheduledMessageId";
import { ChannelId } from "../valueObjects/ids/ChannelId";
import { CronSchedule } from "../valueObjects/CronSchedule";
import { MessageContent } from "../valueObjects/MessageContent";

export interface ScheduledMessageProps {
  channelId: ChannelId;
  cronSchedule: CronSchedule;
  messageContent: MessageContent;
  description?: string;
  isActive?: boolean;
  lastExecuted?: Date;
  nextExecution?: Date;
}

export class ScheduledMessage extends Entity<ScheduledMessageId> {
  private readonly _channelId: ChannelId;
  private readonly _cronSchedule: CronSchedule;
  private _messageContent: MessageContent;
  private _description: string;
  private _isActive: boolean;
  private _lastExecuted: Date | null;
  private _nextExecution: Date | null;

  private constructor(
    id: ScheduledMessageId,
    props: ScheduledMessageProps
  ) {
    super(id);
    this._channelId = props.channelId;
    this._cronSchedule = props.cronSchedule;
    this._messageContent = props.messageContent;
    this._description = props.description || "";
    this._isActive = props.isActive ?? true;
    this._lastExecuted = props.lastExecuted || null;
    this._nextExecution = props.nextExecution || null;
  }

  static create(props: ScheduledMessageProps): ScheduledMessage {
    const id = ScheduledMessageId.generate();
    return new ScheduledMessage(id, props);
  }

  static restore(
    id: ScheduledMessageId,
    props: ScheduledMessageProps
  ): ScheduledMessage {
    return new ScheduledMessage(id, props);
  }

  get channelId(): ChannelId {
    return this._channelId;
  }

  get cronSchedule(): CronSchedule {
    return this._cronSchedule;
  }

  get messageContent(): MessageContent {
    return this._messageContent;
  }

  get description(): string {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastExecuted(): Date | null {
    return this._lastExecuted;
  }

  get nextExecution(): Date | null {
    return this._nextExecution;
  }

  updateContent(content: MessageContent): void {
    this._messageContent = content;
  }

  updateDescription(description: string): void {
    this._description = description;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  canExecute(): boolean {
    if (!this._isActive) {
      return false;
    }

    if (!this._nextExecution) {
      return true; // First time execution
    }

    return new Date() >= this._nextExecution;
  }

  recordExecution(executedAt: Date = new Date()): Result<void, Error> {
    if (!this.canExecute()) {
      return Err(new Error("Message cannot be executed at this time"));
    }

    this._lastExecuted = executedAt;
    this._nextExecution = this.calculateNextExecution(executedAt);
    
    return Ok(undefined);
  }

  private calculateNextExecution(fromDate: Date): Date | null {
    // 簡単な実装：次の日の同じ時間
    // 実際のプロダクションではcronパーサーライブラリを使用
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  setNextExecution(nextExecution: Date): void {
    this._nextExecution = nextExecution;
  }
}