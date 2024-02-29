import { Effect } from 'effect';

import { NoVersionBumpRequestedError } from '../errors/no-version-bump-requested.error';

import { Keywords } from './get-keywords';

export type BumpType = 'major' | 'minor' | 'patch' | 'none';

const isBumpRequestedFor = (keywords: string[], messages: string[]) =>
  messages.some((mes) => keywords.some((key) => mes.startsWith(key)));

export const getBumpType = ([messages, keywords]: [
  messages: string[],
  keywords: Keywords,
]): Effect.Effect<BumpType, NoVersionBumpRequestedError> =>
  Effect.withSpan(__filename)(
    Effect.gen(function* (_) {
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

      return yield* _(Effect.fail(new NoVersionBumpRequestedError()));
    }),
  );
