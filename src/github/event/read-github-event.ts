import { env } from 'node:process';

import { Effect, pipe } from 'effect';

import { NoGithubEventError } from '../../errors/index.js';
import { readJsonEffect } from '../../fs/read-json/index.js';
import type { GithubEvent } from '../../types/index.js';

export const readGithubEvent = pipe(
  pipe(
    Effect.gen(function* () {
      const maybeEventPath = env.GITHUB_EVENT_PATH;
      if (maybeEventPath === undefined) {
        return yield* Effect.fail(
          new NoGithubEventError({
            message: 'GITHUB_EVENT_PATH environment variable is undefined',
          }),
        );
      }

      return yield* readJsonEffect<GithubEvent>(maybeEventPath);
    }),
    Effect.withSpan('read-github-event'),
  ),
);
