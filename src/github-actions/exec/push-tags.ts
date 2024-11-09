import { exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionsExecError } from '../../errors/index.js';

export const pushTags = pipe(
  Effect.tryPromise({
    try: () => exec('git push', ['--tags']),
    catch: (e) => new GithubActionsExecError({ message: (e as Error).message }),
  }),
  Effect.withSpan('push-tags'),
);
