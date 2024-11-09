import { exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';
import type { BumpType } from '../../semver/get-bump-type';

export const setVersion = (bumpType: BumpType) =>
  pipe(
    Effect.tryPromise({
      try: () => exec('npm version', [bumpType, '--force']),
      catch: (e) =>
        new GithubActionsExecError({ message: (e as Error).message }),
    }),
    Effect.withSpan('set-version', { attributes: { bumpType } }),
  );
