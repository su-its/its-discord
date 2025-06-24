import { Identifier } from "../../common/Identifier";
import { Result, Ok, Err } from "../../common/Result";

export class DiscordId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<DiscordId, Error> {
    if (!value) {
      return Err(new Error("Discord ID cannot be empty"));
    }
    
    if (!/^\d{17,19}$/.test(value)) {
      return Err(new Error("Discord ID must be 17-19 digits"));
    }

    return Ok(new DiscordId(value));
  }

  getValue(): string {
    return this.toValue();
  }
}