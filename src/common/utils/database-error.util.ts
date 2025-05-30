import { PostgresErrorCode } from '../../database/postgres-error-codes.enum';

export interface DatabaseError {
  code: PostgresErrorCode;
  detail?: string;
  table?: string;
  column?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  if (!isRecord(error)) {
    return false;
  }

  const { code } = error;
  return Boolean(code && Object.values(PostgresErrorCode).includes(code as PostgresErrorCode));
}