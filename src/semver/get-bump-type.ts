import { Effect, pipe } from 'effect';

import { NoVersionBumpRequestedError } from '../errors/index.js';

import type { Keywords } from './get-keywords.js';

export type BumpType = 'major' | 'minor' | 'patch';

const isBumpRequestedFor = (keywords: string[], messages: string[]) =>
  messages.some((mes) => keywords.some((key) => mes.startsWith(key)));

export const getBumpType = ([messages, keywords]: [
  messages: string[],
  keywords: Keywords,
]) =>
  pipe(
    Effect.gen(function* () {
      const isMajorBump = isBumpRequestedFor(keywords.major, messages);
      if (isMajorBump) {
        return 'major';
      }

      const isMinorBump = isBumpRequestedFor(keywords.minor, messages);
      if (isMinorBump) {
        return 'minor';
      }

      if (keywords.shouldDefaultToPatch) {
        return 'patch';
      }

      const isPatchBump = isBumpRequestedFor(keywords.patch, messages);
      if (isPatchBump) {
        return 'patch';
      }

      return yield* Effect.fail(
        new NoVersionBumpRequestedError({
          cause: 'No version bump requested',
        }),
      );
    }),
    Effect.withSpan('get-bump-type', {
      attributes: {
        messages,
        keywords,
      },
    }),
  );
