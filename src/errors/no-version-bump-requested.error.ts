import { TaggedError } from 'effect/Data';

export class NoVersionBumpRequestedError extends TaggedError(
  'no-version-bump-requested',
)<{
  cause?: unknown;
  message?: string;
}> {}
