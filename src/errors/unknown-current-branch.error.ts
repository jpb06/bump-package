import { TaggedError } from 'effect/Data';

export class UnknownCurrentBranchError extends TaggedError(
  'unknown-current-branch',
)<{
  cause?: unknown;
  message?: string;
}> {}
