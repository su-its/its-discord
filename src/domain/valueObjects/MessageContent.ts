import { Result, Ok, Err } from "../common/Result";

export class MessageContent {
  private constructor(private readonly value: string | (() => Promise<string>)) {}

  static createStatic(content: string): Result<MessageContent, Error> {
    if (!content || content.trim().length === 0) {
      return Err(new Error("Message content cannot be empty"));
    }

    if (content.length > 2000) {
      return Err(new Error("Message content cannot exceed 2000 characters"));
    }

    return Ok(new MessageContent(content.trim()));
  }

  static createDynamic(contentGenerator: () => Promise<string>): MessageContent {
    return new MessageContent(contentGenerator);
  }

  async getContent(): Promise<string> {
    if (typeof this.value === "string") {
      return this.value;
    }
    return await this.value();
  }

  isDynamic(): boolean {
    return typeof this.value === "function";
  }

  toString(): string {
    if (typeof this.value === "string") {
      return this.value;
    }
    return "[Dynamic Content]";
  }
}