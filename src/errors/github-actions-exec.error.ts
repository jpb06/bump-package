import { TaggedError } from 'effect/Data';

export class GithubActionsExecError extends TaggedError('github-actions-exec')<{
  cause?: unknown;
  message?: string;
}> {}
