import { Match } from 'effect';
import type { UnknownException } from 'effect/Cause';

import type {
  CommitMessagesExtractionError,
  GithubActionsExecError,
  InvalidKeywordsError,
  NoGithubEventError,
  PackageJsonVersionFetchingError,
  UnknownCurrentBranchError,
  UnknownDefaultBranchError,
} from '../errors/index.js';

export const getErrorMessageFrom = (
  cause:
    | UnknownException
    | NoGithubEventError
    | UnknownDefaultBranchError
    | UnknownCurrentBranchError
    | GithubActionsExecError
    | CommitMessagesExtractionError
    | InvalidKeywordsError
    | PackageJsonVersionFetchingError,
) =>
  Match.value(cause).pipe(
    Match.when(
      { _tag: 'no-github-event' },
      () => '❌ Failed to get github event data.',
    ),
    Match.when(
      { _tag: 'unknown-current-branch' },
      () => '❌ Failed to get current branch from github event.',
    ),
    Match.when(
      { _tag: 'unknown-default-branch' },
      () => '❌ Failed to get default branch from github event.',
    ),
    Match.when(
      { _tag: 'commit-messages-extraction' },
      () => '❌ Failed to extract commit messages from github event.',
    ),
    Match.when(
      { _tag: 'invalid-keywords' },
      () => '❌ Invalid keywords provided.',
    ),
    Match.when(
      { _tag: 'package-json-version-fetching-failure' },
      () => '❌ Failed to read package json file.',
    ),
    Match.orElse(() => '❌ Oh no! An unknown error occured.'),
  );
