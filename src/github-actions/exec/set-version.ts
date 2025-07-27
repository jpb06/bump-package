import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import { getGitBumpData } from '../../git/get-git-bump-data.js';
import type { BumpType } from '../../semver/get-bump-type.js';

export const setVersion = (bumpType: BumpType) =>
  pipe(
    Effect.gen(function* () {
      const cwd = yield* GithubActionsLayer.getInput('cwd');

      const { message, tagPrefix } = yield* getGitBumpData(cwd);

      yield* GithubActionsLayer.exec(
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
      );
    }),
    Effect.withSpan('set-version', { attributes: { bumpType } }),
  );
