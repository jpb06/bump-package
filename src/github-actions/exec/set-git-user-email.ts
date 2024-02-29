import { exec } from '@actions/exec';
import { Effect } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';

export const setGitUserEmail = (email: string) =>
  Effect.withSpan(__filename)(
    Effect.tryPromise({
      try: () => exec('git config', ['--global', 'user.email', email]),
      catch: (e) => new GithubActionsExecError(e),
    }),
  );
