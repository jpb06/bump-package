import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionsExecError } from '../../errors/index.js';
import { getGitBumpData } from '../../git/get-git-bump-data.js';
import type { BumpType } from '../../semver/get-bump-type.js';

export const setVersion = (bumpType: BumpType) =>
  pipe(
    Effect.gen(function* () {
      const cwd = getInput('cwd');

      const { message, tagPrefix } = yield* getGitBumpData(cwd);

      yield* Effect.tryPromise({
        try: () =>
          exec(
            'npm version',
            [
              bumpType,
              '--force',
              `--tag-version-prefix=${tagPrefix}`,
              '--m',
              message,
            ],
            {
              cwd,
            },
          ),
        catch: (e) =>
          new GithubActionsExecError({ message: (e as Error).message }),
      });
    }),
    Effect.withSpan('set-version', { attributes: { bumpType } }),
  );
