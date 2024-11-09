import { exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionsExecError } from '../../errors/index.js';

export const setGitUserName = (userName: string) =>
  pipe(
    Effect.tryPromise({
      try: () => exec('git config', ['--global', 'user.name', userName]),
      catch: (e) =>
        new GithubActionsExecError({ message: (e as Error).message }),
    }),
    Effect.withSpan('set-git-user-name', { attributes: { userName } }),
  );
