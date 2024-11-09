import { readFileSync } from 'node:fs';

import { Effect, pipe } from 'effect';

import { NoGithubEventError } from '../../errors/no-github-event.error';
import type { GithubEvent } from '../../types/github.types';

export const readGithubEvent = pipe(
  pipe(
    Effect.try(
      () =>
        JSON.parse(
          readFileSync(process.env.GITHUB_EVENT_PATH as string, {
            encoding: 'utf8',
          }),
        ) as GithubEvent,
    ),
    Effect.catchAll((e) => new NoGithubEventError({ message: e.message })),
    Effect.withSpan('read-github-event'),
  ),
);
