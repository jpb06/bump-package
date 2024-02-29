import { Effect } from 'effect';

import { UnknownDefaultBranchError } from '../errors/unknown-default-branch.error';
import { GithubEvent } from '../types/github';

export const failIfNoDefaultBranch = (event?: GithubEvent) =>
  Effect.withSpan(__filename)(
    Effect.gen(function* (_) {
      const defaultBranch = event?.repository?.default_branch;
      if (!defaultBranch || defaultBranch.length === 0) {
        yield* _(Effect.fail(new UnknownDefaultBranchError()));
      }
    }),
  );
