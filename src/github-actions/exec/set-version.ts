import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import path from 'node:path';
import {
  GithubActionsExecError,
  PackageJsonNameFetchingError,
} from '../../errors/index.js';
import { readJsonEffect } from '../../fs/fs.effects.js';
import type { BumpType } from '../../semver/get-bump-type.js';
import type { PackageJson } from '../../types/index.js';

const getGitBumpData = (cwd: string) =>
  pipe(
    Effect.gen(function* () {
      const packageData = yield* readJsonEffect<PackageJson>(
        path.join(cwd, 'package.json'),
      );

      const tagPrefix = `${packageData.name}@v`;
      const message = `chore(${packageData.name}): bump version to %s`;

      return {
        tagPrefix,
        message,
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
