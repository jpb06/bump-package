import path from 'node:path';
import { Effect, pipe } from 'effect';

import { PackageJsonNameFetchingError } from '../errors/index.js';
import { readJsonEffect } from '../fs/fs.effects.js';
import type { PackageJson } from '../types/index.js';

export const getGitBumpData = (cwd: string) =>
  pipe(
    Effect.gen(function* () {
      const isMonorepo = cwd !== '.';
      if (isMonorepo) {
        const packageData = yield* readJsonEffect<PackageJson>(
          path.join(cwd, 'package.json'),
        );

        return {
          tagPrefix: `${packageData.name}@v`,
          message: `chore(${packageData.name}): bump version to %s`,
        };
      }

      return {
        tagPrefix: 'v',
        message: 'chore: bump version to %s',
      };
    }),
    Effect.catchAll(
      (e) =>
        new PackageJsonNameFetchingError({
          cause: e,
        }),
    ),
    Effect.withSpan('get-git-bump-data', { attributes: { cwd } }),
  );
