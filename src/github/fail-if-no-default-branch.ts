import { Effect, pipe } from 'effect';

import { UnknownDefaultBranchError } from '../errors/index.js';
import type { GithubEvent } from '../types/index.js';

export const failIfNoDefaultBranch = (event?: GithubEvent) =>
  pipe(
    Effect.gen(function* () {
      const defaultBranch = event?.repository?.default_branch;
      if (!defaultBranch || defaultBranch.length === 0) {
        yield* Effect.fail(
          new UnknownDefaultBranchError({
            cause: 'Failed to locate default branch',
          }),
        );
      }
    }),
    Effect.withSpan('fail-if-no-default-branch', {
      attributes: { event: JSON.stringify(event, null, 2) },
    }),
  );
