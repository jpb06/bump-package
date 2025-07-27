import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import { validateKeywords } from './validate-keywords.js';

const splitAndKeepNonEmpty = (input: string) =>
  input.split(',').filter((s) => s.length > 0);

export const getKeywords = pipe(
  Effect.all(
    [
      GithubActionsLayer.getInput('should-default-to-patch'),
      GithubActionsLayer.getInput('major-keywords'),
      GithubActionsLayer.getInput('minor-keywords'),
      GithubActionsLayer.getInput('patch-keywords'),
    ],
    { concurrency: 'unbounded' },
  ),
  Effect.map(
    ([
      shouldDefaultToPatchInput,
      majorkeywordsInput,
      minorkeywordsInput,
      patchkeywordsInput,
    ]) => ({
      shouldDefaultToPatch: shouldDefaultToPatchInput === 'true',
      major: splitAndKeepNonEmpty(majorkeywordsInput),
      minor: splitAndKeepNonEmpty(minorkeywordsInput),
      patch: splitAndKeepNonEmpty(patchkeywordsInput),
    }),
  ),
  Effect.flatMap(validateKeywords),
  Effect.withSpan('get-keywords'),
);
