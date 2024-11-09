import { Match } from 'effect';

import type { NoVersionBumpRequestedError } from '../errors/no-version-bump-requested.error';
import type { NotRunningOnDefaultBranchError } from '../errors/not-running-on-default-branch.error';

export const getInfoMessageFrom = (
  cause: NotRunningOnDefaultBranchError | NoVersionBumpRequestedError,
) =>
  Match.value(cause).pipe(
    Match.when(
      { _tag: 'not-running-on-default-branch' },
      () => 'ℹ️ Task cancelled: not running on default branch.',
    ),
    Match.when(
      { _tag: 'no-version-bump-requested' },
      () => 'ℹ️ Task cancelled: no version bump requested.',
    ),
    Match.exhaustive,
  );
