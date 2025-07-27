import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import type { GithubEvent } from '../../types/index.js';

export const maybeDebugEvent = (event?: GithubEvent) =>
  pipe(
    Effect.gen(function* () {
      const debugInput = yield* GithubActionsLayer.getInput('debug');
      if (debugInput === 'true') {
        yield* GithubActionsLayer.info('🕵️ Github event:');
        yield* GithubActionsLayer.info(JSON.stringify(event, null, 2));
      }
    }),
    Effect.withSpan('maybe-debug-event', {
      attributes: { event: JSON.stringify(event, null, 2) },
    }),
  );
