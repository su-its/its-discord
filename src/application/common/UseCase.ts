import type { Result } from "../../domain/common/Result";

export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Result<TResponse, Error>>;
}
