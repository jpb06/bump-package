import { getInput, info } from '@actions/core';
import { Effect } from 'effect';

import { GithubEvent } from '../../types/github';

export const maybeDebugEvent = (event?: GithubEvent) =>
  Effect.withSpan(__filename)(
    Effect.try(() => {
      const debugEvent = getInput('debug') === 'true';
      if (debugEvent) {
        info(`🕵️ Github event:`);
        info(JSON.stringify(event, null, 2));
      }
    }),
  );
