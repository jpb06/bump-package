import { info, setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { setGitConfig } from '../git/set-git-config.js';
import { getGithubEventData } from '../github/event/get-github-event-data.js';
import { push, pushTags, setVersion } from '../github-actions/exec/index.js';
import { outputVersion } from '../output/output.version.js';
import { getBumpType } from '../semver/get-bump-type.js';
import { getKeywords } from '../semver/get-keywords.js';

export const actionWorkflow = pipe(
  Effect.all([getGithubEventData, getKeywords]),
  Effect.flatMap(getBumpType),
  Effect.flatMap((bumpType) =>
    Effect.all([
      setGitConfig,
      setVersion(bumpType),
      push,
      pushTags,
      outputVersion,
    ]),
  ),
  Effect.tap(() => setOutput('bump-performed', true)),
  Effect.catchTag('no-version-bump-requested', () => {
    info('ℹ️ Task cancelled: no version bump requested.');
    return Effect.void;
  }),
  Effect.catchTag('not-running-on-default-branch', () => {
    info('ℹ️ Task cancelled: not running on default branch.');
    return Effect.void;
  }),
  Effect.withSpan('action-workflow'),
);
