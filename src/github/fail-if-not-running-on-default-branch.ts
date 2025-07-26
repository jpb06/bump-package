import { Effect, pipe } from 'effect';

import { NotRunningOnDefaultBranchError } from '../errors/index.js';
import type { GithubEvent } from '../types/index.js';
import { getCurrentBranch } from './get-current-branch.js';

export const failIfNotRunningOnDefaultBranch = (event: GithubEvent) =>
  pipe(
    Effect.gen(function* () {
      const currentBranch = yield* getCurrentBranch(event);
      const defaultBranch = event?.repository?.default_branch;

      const isDefaultBranch = currentBranch === defaultBranch;
      if (!isDefaultBranch) {
        yield* Effect.fail(
          new NotRunningOnDefaultBranchError({
            cause: 'Not running on default branch',
          }),
        );
      }
    }),
    Effect.withSpan('fail-if-not-running-on-current-branch', {
      attributes: { event: JSON.stringify(event, null, 2) },
    }),
  );
