import { Result, Ok, Err } from "../common/Result";

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Email, Error> {
    if (!value) {
      return Err(new Error("Email cannot be empty"));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Err(new Error("Invalid email format"));
    }

    if (!value.endsWith("@shizuoka.ac.jp")) {
      return Err(new Error("Email must be from shizuoka.ac.jp domain"));
    }

    return Ok(new Email(value.toLowerCase()));
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split("@")[1];
  }

  getLocalPart(): string {
    return this.value.split("@")[0];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}