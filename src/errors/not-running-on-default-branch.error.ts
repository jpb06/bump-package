import { TaggedError } from 'effect/Data';

export class NotRunningOnDefaultBranchError extends TaggedError(
  'not-running-on-default-branch',
)<{
  cause?: unknown;
  message?: string;
}> {}
