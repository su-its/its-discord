export abstract class Result<T, E> {
  abstract isSuccess(): boolean;
  abstract isFailure(): boolean;
  abstract getValue(): T;
  abstract getError(): E;

  static ok<T, E>(value: T): Result<T, E> {
    return new Success(value);
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Failure(error);
  }
}

class Success<T, E> extends Result<T, E> {
  constructor(private readonly value: T) {
    super();
  }

  isSuccess(): boolean {
    return true;
  }

  isFailure(): boolean {
    return false;
  }

  getValue(): T {
    return this.value;
  }

  getError(): E {
    throw new Error("Cannot get error from success result");
  }
}

class Failure<T, E> extends Result<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isSuccess(): boolean {
    return false;
  }

  isFailure(): boolean {
    return true;
  }

  getValue(): T {
    throw new Error("Cannot get value from failure result");
  }

  getError(): E {
    return this.error;
  }
}

export const Ok = Result.ok;
export const Err = Result.err;
