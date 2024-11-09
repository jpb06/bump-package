import { TaggedError } from 'effect/Data';

export class PackageJsonVersionFetchingError extends TaggedError(
  'package-json-version-fetching-failure',
)<{
  cause?: unknown;
  message?: string;
}> {}
