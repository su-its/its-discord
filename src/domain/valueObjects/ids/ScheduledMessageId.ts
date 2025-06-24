import { Identifier } from "../../common/Identifier";

export class ScheduledMessageId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ScheduledMessageId {
    return new ScheduledMessageId(value);
  }

  static generate(): ScheduledMessageId {
    return new ScheduledMessageId(crypto.randomUUID());
  }
}