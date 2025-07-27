import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import { setGitConfig } from '../git/set-git-config.js';
import { getGithubEventData } from '../github/event/get-github-event-data.js';
import { setVersion } from '../github-actions/exec/set-version.js';
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
      GithubActionsLayer.exec('git push'),
      GithubActionsLayer.exec('git push', ['--tags']),
      outputVersion,
    ]),
  ),
  Effect.tap(() => GithubActionsLayer.setOutput('bump-performed', true)),
  Effect.catchTag('no-version-bump-requested', () => {
    return GithubActionsLayer.info(
      'ℹ️ Task cancelled: no version bump requested.',
    );
  }),
  Effect.catchTag('not-running-on-default-branch', () => {
    return GithubActionsLayer.info(
      'ℹ️ Task cancelled: not running on default branch.',
    );
  }),
  Effect.withSpan('action-workflow'),
);
