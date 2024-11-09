import { setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { PackageJsonVersionFetchingError } from '../errors/index.js';
import { readJsonEffect } from '../fs/fs.effects.js';

export const outputVersion = pipe(
  Effect.gen(function* () {
    const packageData = yield* readJsonEffect<{ version: string }>(
      './package.json',
    );

    setOutput('new-version', packageData.version);
  }),
  Effect.catchAll((e) => {
    return Effect.fail(new PackageJsonVersionFetchingError({ cause: e }));
  }),
  Effect.withSpan('output-version'),
);