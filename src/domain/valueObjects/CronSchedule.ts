import { Result, Ok, Err } from "../common/Result";

export class CronSchedule {
  private constructor(private readonly expression: string) {}

  static create(expression: string): Result<CronSchedule, Error> {
    if (!expression) {
      return Err(new Error("Cron expression cannot be empty"));
    }

    if (!CronSchedule.isValidCronExpression(expression)) {
      return Err(new Error("Invalid cron expression format"));
    }

    return Ok(new CronSchedule(expression));
  }

  private static isValidCronExpression(expression: string): boolean {
    const cronParts = expression.trim().split(/\s+/);
    if (cronParts.length !== 5) {
      return false;
    }

    // 基本的な検証：各パートが空でないことをチェック
    return cronParts.every(part => part && part.length > 0);
  }

  getExpression(): string {
    return this.expression;
  }

  equals(other: CronSchedule): boolean {
    return this.expression === other.expression;
  }

  toString(): string {
    return this.expression;
  }
}