import path from 'node:path';

import { getInput, setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { PackageJsonVersionFetchingError } from '../errors/index.js';
import { readJsonEffect } from '../fs/read-json/index.js';
import type { PackageJson } from '../types/index.js';

export const outputVersion = pipe(
  Effect.gen(function* () {
    const cwd = getInput('cwd');
    const isMonorepo = cwd !== '.';
    const packageJsonPath = isMonorepo
      ? path.join(cwd, 'package.json')
      : './package.json';

    const packageData = yield* readJsonEffect<PackageJson>(packageJsonPath);
    setOutput('new-version', packageData.version);
  }),
  Effect.catchAll((e) => {
    return Effect.fail(new PackageJsonVersionFetchingError({ cause: e }));
  }),
  Effect.withSpan('output-version'),
);
