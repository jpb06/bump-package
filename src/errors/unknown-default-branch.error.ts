import { Data } from 'effect';

export class UnknownDefaultBranchError extends Data.TaggedError(
  'UnknownDefaultBranch',
) {}
