import { Match } from 'effect';
import { UnknownException } from 'effect/Cause';

import { CommitMessagesExtractionError } from '../errors/commit-messages-extraction.error';
import { GithubActionsExecError } from '../errors/github-actions-exec.error';
import { InvalidKeywordsError } from '../errors/invalid-keywords.error';
import { NoGithubEventError } from '../errors/no-github-event.error';
import { UnknownCurrentBranchError } from '../errors/unknown-current-branch.error';
import { UnknownDefaultBranchError } from '../errors/unknown-default-branch.error';

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
      { _tag: 'NoGithubEvent' },
      () => '❌ Failed to get github event data.',
    ),
    Match.when(
      { _tag: 'UnknownCurrentBranch' },
      () => '❌ Failed to get current branch from github event.',
    ),
    Match.when(
      { _tag: 'UnknownDefaultBranch' },
      () => '❌ Failed to get default branch from github event.',
    ),
    Match.when(
      { _tag: 'CommitMessagesExtraction' },
      () => '❌ Failed to extract commit messages from github event.',
    ),
    Match.when(
      { _tag: 'InvalidKeywords' },
      () => '❌ Invalid keywords provided.',
    ),
    Match.orElse(() => '❌ Oh no! An unknown error occured.'),
  );
