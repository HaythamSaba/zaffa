/**
 * Minimal server-side logger. Never log form contents (personal data);
 * log reasons and error details only.
 */
export interface Logger {
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export const logger: Logger = {
  warn: (message, context) => console.warn(message, context ?? {}),
  error: (message, context) => console.error(message, context ?? {}),
};
