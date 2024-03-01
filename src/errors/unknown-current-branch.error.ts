import { Data } from 'effect';

export class UnknownCurrentBranchError extends Data.TaggedError(
  'UnknownCurrentBranch',
) {}
