import { Err, Ok, type Result } from "../common/Result";

export class StudentNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<StudentNumber, Error> {
    if (!value) {
      return Err(new Error("Student number cannot be empty"));
    }

    if (!/^[a-zA-Z0-9]{8}$/.test(value)) {
      return Err(new Error("Student number must be 8 alphanumeric characters"));
    }

    return Ok(new StudentNumber(value.toUpperCase()));
  }

  getValue(): string {
    return this.value;
  }

  equals(other: StudentNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
