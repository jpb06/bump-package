import { exec } from '@actions/exec';
import { Effect } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';

export const pushTags = Effect.withSpan(__filename)(
  Effect.tryPromise({
    try: () => exec('git push', ['--tags']),
    catch: (e) => new GithubActionsExecError(e),
  }),
);
