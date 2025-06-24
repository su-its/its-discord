import { Identifier } from "../../common/Identifier";
import { Result, Ok, Err } from "../../common/Result";

export class ChannelId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<ChannelId, Error> {
    if (!value) {
      return Err(new Error("Channel ID cannot be empty"));
    }
    
    if (!/^\d{17,19}$/.test(value)) {
      return Err(new Error("Channel ID must be 17-19 digits"));
    }

    return Ok(new ChannelId(value));
  }

  getValue(): string {
    return this.toValue();
  }
}