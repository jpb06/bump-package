import { exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';

export const setGitUserEmail = (email: string) =>
  pipe(
    Effect.tryPromise({
      try: () => exec('git config', ['--global', 'user.email', email]),
      catch: (e) =>
        new GithubActionsExecError({ message: (e as Error).message }),
    }),
    Effect.withSpan('set-git-user-email', { attributes: { email } }),
  );
