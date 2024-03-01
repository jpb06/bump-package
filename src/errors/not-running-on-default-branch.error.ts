import { Data } from 'effect';

export class NotRunningOnDefaultBranchError extends Data.TaggedError(
  'NotRunningOnDefaultBranch',
) {}
