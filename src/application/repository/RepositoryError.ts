export class RepositoryError extends Error {
  public innerError?: Error;

  constructor(message: string, innerError?: Error) {
    super(message);
    this.name = "RepositoryError";
    this.innerError = innerError;
  }
}
