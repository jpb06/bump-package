import { Effect } from 'effect';

import { CommitMessagesExtractionError } from '../errors/commit-messages-extraction.error';
import { GithubEvent } from '../types/github';

const extractSquashCommitMessage = (message: string) =>
  message
    .substring(message.indexOf('*'))
    .split('\r\n\r\n')
    .map((el) => el.substring(el.indexOf('* ') + 2));

export const extractCommitsMessages = (event: GithubEvent) =>
  Effect.withSpan(__filename)(
    Effect.gen(function* (_) {
      const isSquashCommit =
        Array.isArray(event.commits) &&
        event.commits.length === 1 &&
        event.commits[0].committer.name === 'GitHub' &&
        event.commits[0].distinct === true;
      if (isSquashCommit) {
        return extractSquashCommitMessage(event.commits![0].message);
      }

      const isCompletedWorkflowEvent =
        event.action === 'completed' &&
        event.workflow_run?.head_commit?.message !== undefined;
      if (isCompletedWorkflowEvent) {
        return extractSquashCommitMessage(
          event.workflow_run!.head_commit!.message!,
        );
      }

      if (Array.isArray(event.commits)) {
        return event.commits.map((el) => el.message);
      }

      return yield* _(new CommitMessagesExtractionError());
    }),
  );
