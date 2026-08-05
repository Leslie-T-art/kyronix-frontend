export type ApiErrorCode =
'UNAUTHORIZED' |
'FORBIDDEN' |
'VALIDATION' |
'UPSTREAM' |
'TIMEOUT' |
'NOT_FOUND';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  correlationId: string;
}

const MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: 'Your session has expired. Sign in again to continue.',
  FORBIDDEN: 'Your role does not grant access to this data.',
  VALIDATION: 'The engine returned data that failed validation and was rejected.',
  UPSTREAM: 'The risk engine is temporarily unavailable. Retry in a moment.',
  TIMEOUT: 'The request timed out before the engine responded.',
  NOT_FOUND: 'The requested resource could not be found.'
};

export function createApiError(code: ApiErrorCode, correlationId: string): ApiError {
  return { code, message: MESSAGES[code], correlationId };
}