import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import { InvalidKeywordsError } from '../errors/invalid-keywords.error.js';

export interface Keywords {
  major: string[];
  minor: string[];
  patch: string[];
  shouldDefaultToPatch: boolean;
}

export const validateKeywords = (input: Keywords) =>
  pipe(
    Effect.gen(function* () {
      let bail = false;
      if (input.shouldDefaultToPatch === false && input.patch.length === 0) {
        bail = true;
        yield* GithubActionsLayer.error(
          '⚠️ Expecting at least one patch keyword but got 0.',
        );
      }
      if (input.minor.length === 0) {
        bail = true;
        yield* GithubActionsLayer.error(
          '⚠️ Expecting at least one minor keyword but got 0.',
        );
      }
      if (input.major.length === 0) {
        bail = true;
        yield* GithubActionsLayer.error(
          '⚠️ Expecting at least one major keyword but got 0.',
        );
      }

      if (bail) {
        return yield* Effect.fail(
          new InvalidKeywordsError({
            cause: 'Invalid keywords',
          }),
        );
      }

      return input;
    }),
    Effect.withSpan('validate-keywords'),
  );
