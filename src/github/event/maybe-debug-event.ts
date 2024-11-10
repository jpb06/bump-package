import { getInput, info } from '@actions/core';
import { Effect, pipe } from 'effect';

import type { GithubEvent } from '../../types/index.js';

export const maybeDebugEvent = (event?: GithubEvent) =>
  pipe(
    Effect.try(() => {
      const debugEvent = getInput('debug') === 'true';
      if (debugEvent) {
        info('🕵️ Github event:');
        info(JSON.stringify(event, null, 2));
      }
    }),
    Effect.withSpan('maybe-debug-event', { attributes: { event } }),
  );
