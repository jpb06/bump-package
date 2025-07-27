import path from 'node:path';

import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import { PackageJsonVersionFetchingError } from '../errors/index.js';
import { readJsonEffect } from '../fs/read-json/index.js';
import type { PackageJson } from '../types/index.js';

export const outputVersion = pipe(
  Effect.gen(function* () {
    const cwd = yield* GithubActionsLayer.getInput('cwd');
    const isMonorepo = cwd !== '.';
    const packageJsonPath = isMonorepo
      ? path.join(cwd, 'package.json')
      : './package.json';

    const packageData = yield* readJsonEffect<PackageJson>(packageJsonPath);
    yield* GithubActionsLayer.setOutput('new-version', packageData.version);
  }),
  Effect.catchAll((e) =>
    Effect.fail(new PackageJsonVersionFetchingError({ cause: e })),
  ),
  Effect.withSpan('output-version'),
);
