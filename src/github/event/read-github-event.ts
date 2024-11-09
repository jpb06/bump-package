import { readFileSync } from 'node:fs';
import { env } from 'node:process';

import { Effect, pipe } from 'effect';

import { NoGithubEventError } from '../../errors/index.js';
import type { GithubEvent } from '../../types/github.types.js';

export const readGithubEvent = pipe(
  pipe(
    Effect.try(
      () =>
        JSON.parse(
          readFileSync(env.GITHUB_EVENT_PATH as string, {
            encoding: 'utf8',
          }),
        ) as GithubEvent,
    ),
    Effect.catchAll((e) => new NoGithubEventError({ message: e.message })),
    Effect.withSpan('read-github-event'),
  ),
);
