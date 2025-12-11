import { logger } from '../telemetry/logger';

export type RetryOptions = {
  retries: number;
  minTimeoutMs: number;
  maxTimeoutMs: number;
  factor: number;
  shouldRetry?: (error: unknown) => boolean;
};

const defaultOptions: RetryOptions = {
  retries: 3,
  minTimeoutMs: 100,
  maxTimeoutMs: 2_000,
  factor: 2,
  shouldRetry: () => true
};

export async function withDbRetry<T>(operation: (attempt: number) => Promise<T>, options?: Partial<RetryOptions>): Promise<T> {
  const merged = { ...defaultOptions, ...options };
  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await operation(attempt + 1);
    } catch (error) {
      attempt += 1;
      const retryable = attempt <= merged.retries && (await merged.shouldRetry?.(error));
      if (!retryable) {
        throw error;
      }
      const delay = Math.min(merged.minTimeoutMs * merged.factor ** (attempt - 1), merged.maxTimeoutMs);
      logger.warn({ attempt, delay }, 'Retryable DB operation failed, retrying');
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
