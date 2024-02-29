import { info, setFailed, setOutput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { setGitConfig } from '../git/set-git-config';
import { getGithubEventData } from '../github/event/get-github-event-data';
import { push, pushTags, setVersion } from '../github-actions/exec';
import { getErrorMessageFrom } from '../matchers/get-error-message-from-cause';
import { getInfoMessageFrom } from '../matchers/get-info-message-from-cause';
import { getBumpType } from '../semver/get-bump-type';
import { getKeywords } from '../semver/get-keywords';

export const actionWorkflow = Effect.withSpan(__filename)(
  pipe(
    Effect.all([getGithubEventData, getKeywords]),
    Effect.flatMap(getBumpType),
    Effect.flatMap((bumpType) =>
      Effect.all([setGitConfig, setVersion(bumpType), push, pushTags]),
    ),
    Effect.tap(() => setOutput('bump-performed', true)),
    Effect.catchAll((cause) => {
      setOutput('bump-performed', false);

      if (
        cause._tag === 'NotRunningOnDefaultBranch' ||
        cause._tag === 'NoVersionBumpRequested'
      ) {
        info(getInfoMessageFrom(cause));

        return Effect.unit;
      }

      setFailed(getErrorMessageFrom(cause));

      return Effect.fail(cause);
    }),
  ),
);
