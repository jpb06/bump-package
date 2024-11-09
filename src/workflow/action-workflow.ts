import { info, setFailed, setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { setGitConfig } from '../git/set-git-config';
import { push, pushTags, setVersion } from '../github-actions/exec';
import { getGithubEventData } from '../github/event/get-github-event-data';
import { getErrorMessageFrom } from '../matchers/get-error-message-from-cause';
import { getInfoMessageFrom } from '../matchers/get-info-message-from-cause';
import { getBumpType } from '../semver/get-bump-type';
import { getKeywords } from '../semver/get-keywords';

export const actionWorkflow = pipe(
  Effect.all([getGithubEventData, getKeywords]),
  Effect.flatMap(getBumpType),
  Effect.flatMap((bumpType) =>
    Effect.all([setGitConfig, setVersion(bumpType), push, pushTags]),
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
