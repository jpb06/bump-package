import { TaggedError } from 'effect/Data';

export class PackageJsonNameFetchingError extends TaggedError(
  'package-json-name-fetching-failure',
)<{
  cause?: unknown;
  message?: string;
}> {}
