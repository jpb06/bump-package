import { TaggedError } from 'effect/Data';

export class UnknownDefaultBranchError extends TaggedError(
  'unknown-default-branch',
)<{
  cause?: unknown;
  message?: string;
}> {}
