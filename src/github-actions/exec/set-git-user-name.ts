import { exec } from '@actions/exec';
import { Effect } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';

export const setGitUserName = (userName: string) =>
  Effect.withSpan(__filename)(
    Effect.tryPromise({
      try: () => exec('git config', ['--global', 'user.name', userName]),
      catch: (e) => new GithubActionsExecError(e),
    }),
  );
