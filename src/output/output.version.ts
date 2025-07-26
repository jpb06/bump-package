import { getInput, setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { PackageJsonVersionFetchingError } from '../errors/index.js';
import { readJsonEffect } from '../fs/fs.effects.js';
import type { PackageJson } from '../types/index.js';
import path from "node:path";

export const outputVersion = pipe(
  Effect.gen(function* () {
    const cwd = getInput('cwd');
    const isMonorepo = cwd !== '.';

    let packageData: PackageJson;
    if (isMonorepo) {
        packageData = yield* readJsonEffect<PackageJson>(
            path.join(cwd, 'package.json'),
        );
    } else {
        packageData = yield* readJsonEffect<PackageJson>('./package.json');
    }

    setOutput('new-version', packageData.version);
  }),
  Effect.catchAll((e) => {
    return Effect.fail(new PackageJsonVersionFetchingError({ cause: e }));
  }),
  Effect.withSpan('output-version'),
);
