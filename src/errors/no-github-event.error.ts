import { TaggedError } from 'effect/Data';

export class NoGithubEventError extends TaggedError('no-github-event')<{
  cause?: unknown;
  message?: string;
}> {}
