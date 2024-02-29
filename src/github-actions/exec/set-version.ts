import { exec } from '@actions/exec';
import { Effect } from 'effect';

import { GithubActionsExecError } from '../../errors/github-actions-exec.error';
import { BumpType } from '../../semver/get-bump-type';

export const setVersion = (bumpType: BumpType) =>
  Effect.withSpan(__filename)(
    Effect.tryPromise({
      try: () => exec('npm version', [bumpType, '--force']),
      catch: (e) => new GithubActionsExecError(e),
    }),
  );
