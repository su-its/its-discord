export class RepositoryError extends Error {
  public innerError?: Error;

  constructor(message: string, innerError?: Error) {
    const fullMessage = innerError
      ? `${message} (Inner error: ${innerError.message})`
      : message;
    super(fullMessage);
    this.name = "RepositoryError";
    this.innerError = innerError;
    // innerError のスタックがあれば、現在のスタックに追加する
    if (innerError?.stack) {
      this.stack += `\nCaused by: ${innerError.stack}`;
    }
  }
}
