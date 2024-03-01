import { Data } from 'effect';

export class NoGithubEventError extends Data.TaggedError('NoGithubEvent')<{
  message: string;
}> {}
