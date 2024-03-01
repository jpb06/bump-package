import { Data } from 'effect';

export class NoVersionBumpRequestedError extends Data.TaggedError(
  'NoVersionBumpRequested',
) {}
