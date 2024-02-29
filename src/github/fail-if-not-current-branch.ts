import { Effect } from 'effect';

import { NotRunningOnDefaultBranchError } from '../errors/not-running-on-default-branch.error';
import { GithubEvent } from '../types/github';

import { getCurrentBranch } from './get-current-branch';

export const failIfNotRunningOnCurrentBranch = (event: GithubEvent) =>
  Effect.withSpan(__filename)(
    Effect.gen(function* (_) {
      const currentBranch = yield* _(getCurrentBranch(event));
      const defaultBranch = event?.repository?.default_branch;

      const isDefaultBranch = currentBranch === defaultBranch;
      if (!isDefaultBranch) {
        yield* _(Effect.fail(new NotRunningOnDefaultBranchError()));
      }
    }),
  );
