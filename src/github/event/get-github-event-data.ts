import { Effect, pipe } from 'effect';

import { extractCommitsMessages } from '../extract-commits-messages';
import { failIfNoDefaultBranch } from '../fail-if-no-default-branch';
import { failIfNotRunningOnCurrentBranch } from '../fail-if-not-current-branch';

import { maybeDebugEvent } from './maybe-debug-event';
import { readGithubEvent } from './read-github-event';

export const getGithubEventData = Effect.withSpan(__filename)(
  pipe(
    readGithubEvent,
    Effect.flatMap((event) =>
      Effect.all([
        maybeDebugEvent(event),
        failIfNoDefaultBranch(event),
        failIfNotRunningOnCurrentBranch(event),
        extractCommitsMessages(event),
      ]),
    ),
    Effect.map(([, , , messages]) => messages),
  ),
);
