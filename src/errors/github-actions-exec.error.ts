import { Data } from 'effect';

export class GithubActionsExecError extends Data.TaggedError(
  'GithubActionsExec',
)<{ message: string }> {}
