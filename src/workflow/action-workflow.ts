import { info, setFailed, setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { setGitConfig } from '../git/set-git-config.js';
import { push, pushTags, setVersion } from '../github-actions/exec/index.js';
import { getGithubEventData } from '../github/event/get-github-event-data.js';
import { getErrorMessageFrom } from '../matchers/get-error-message-from-cause.js';
import { getInfoMessageFrom } from '../matchers/get-info-message-from-cause.js';
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
  Effect.catchAll((cause) => {
    setOutput('bump-performed', false);

    if (
      cause._tag === 'not-running-on-default-branch' ||
      cause._tag === 'no-version-bump-requested'
    ) {
      info(getInfoMessageFrom(cause));

      return Effect.void;
    }

    setFailed(getErrorMessageFrom(cause));

    return Effect.fail(cause);
  }),
  Effect.withSpan('action-workflow'),
);
