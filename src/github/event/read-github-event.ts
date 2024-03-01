import { readFileSync } from 'fs';

import { Effect, pipe } from 'effect';

import { NoGithubEventError } from '../../errors/no-github-event.error';
import { GithubEvent } from '../../types/github';

export const readGithubEvent = Effect.withSpan(__filename)(
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
  ),
);
