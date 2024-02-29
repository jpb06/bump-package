import { Effect } from 'effect';

import { UnknownCurrentBranchError } from '../errors/unknown-current-branch.error';
import { GithubEvent } from '../types/github';

export const getCurrentBranch = (event: GithubEvent) =>
  Effect.withSpan(__filename)(
    Effect.gen(function* (_) {
      if (event?.ref !== undefined) {
        return event.ref?.split('/').slice(2).join('/');
      }

      if (
        event.action === 'completed' &&
        event?.workflow_run?.head_branch !== undefined
      ) {
        return event.workflow_run.head_branch;
      }

      return yield* _(Effect.fail(new UnknownCurrentBranchError()));
    }),
  );
