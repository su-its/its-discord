import { Identifier } from "../../common/Identifier";

export class MemberId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MemberId {
    return new MemberId(value);
  }

  static generate(): MemberId {
    return new MemberId(crypto.randomUUID());
  }
}