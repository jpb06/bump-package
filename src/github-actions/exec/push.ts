import { exec } from '@actions/exec';
import { Effect } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';

export const push = Effect.withSpan(__filename)(
  Effect.tryPromise({
    try: () => exec('git push'),
    catch: (e) => new GithubActionsExecError({ message: (e as Error).message }),
  }),
);
