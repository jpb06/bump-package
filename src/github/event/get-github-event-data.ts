import { Effect, pipe } from 'effect';

import { extractCommitsMessages } from '../extract-commits-messages.js';
import { failIfNoDefaultBranch } from '../fail-if-no-default-branch.js';
import { failIfNotRunningOnDefaultBranch } from '../fail-if-not-running-on-default-branch.js';
import { maybeDebugEvent } from './maybe-debug-event.js';
import { readGithubEvent } from './read-github-event.js';

export const getGithubEventData = pipe(
  readGithubEvent,
  Effect.flatMap((event) =>
    Effect.all([
      maybeDebugEvent(event),
      failIfNoDefaultBranch(event),
      failIfNotRunningOnDefaultBranch(event),
      extractCommitsMessages(event),
    ]),
  ),
  Effect.map(([, , , messages]) => [...messages]),
  Effect.withSpan('get-github-event-data'),
);
