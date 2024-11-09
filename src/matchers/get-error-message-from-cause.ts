import { Match } from 'effect';
import type { UnknownException } from 'effect/Cause';

import type { CommitMessagesExtractionError } from '../errors/commit-messages-extraction.error';
import type { GithubActionsExecError } from '../errors/github-actions-exec.error';
import type { InvalidKeywordsError } from '../errors/invalid-keywords.error';
import type { NoGithubEventError } from '../errors/no-github-event.error';
import type { UnknownCurrentBranchError } from '../errors/unknown-current-branch.error';
import type { UnknownDefaultBranchError } from '../errors/unknown-default-branch.error';

export const getErrorMessageFrom = (
  cause:
    | UnknownException
    | NoGithubEventError
    | UnknownDefaultBranchError
    | UnknownCurrentBranchError
    | GithubActionsExecError
    | CommitMessagesExtractionError
    | InvalidKeywordsError,
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
    Match.orElse(() => '❌ Oh no! An unknown error occured.'),
  );
