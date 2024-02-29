import { Match } from 'effect';

import { NoVersionBumpRequestedError } from '../errors/no-version-bump-requested.error';
import { NotRunningOnDefaultBranchError } from '../errors/not-running-on-default-branch.error';

export const getInfoMessageFrom = (
  cause: NotRunningOnDefaultBranchError | NoVersionBumpRequestedError,
) =>
  Match.value(cause).pipe(
    Match.when(
      { _tag: 'NotRunningOnDefaultBranch' },
      () => 'ℹ️ Task cancelled: not running on default branch.',
    ),
    Match.when(
      { _tag: 'NoVersionBumpRequested' },
      () => 'ℹ️ Task cancelled: no version bump requested.',
    ),
    Match.exhaustive,
  );
