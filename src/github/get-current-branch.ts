import { Effect, pipe } from 'effect';

import { UnknownCurrentBranchError } from '../errors/index.js';
import type { GithubEvent } from '../types/github.types.js';

export const getCurrentBranch = (event: GithubEvent) =>
  pipe(
    Effect.gen(function* () {
      if (event?.ref !== undefined) {
        return event.ref?.split('/').slice(2).join('/');
      }

      if (
        event.action === 'completed' &&
        event?.workflow_run?.head_branch !== undefined
      ) {
        return event.workflow_run.head_branch;
      }

      return yield* Effect.fail(
        new UnknownCurrentBranchError({
          cause: 'Failed to locate current branch',
        }),
      );
    }),
    Effect.withSpan('get-current-branch', { attributes: { event } }),
  );
