import { Effect, pipe } from 'effect';

import { CommitMessagesExtractionError } from '../errors/index.js';
import type { GithubEvent } from '../types/index.js';

const extractSquashCommitMessage = (message: string) =>
  message
    .substring(message.indexOf('*'))
    .split('\r\n\r\n')
    .map((el) => el.substring(el.indexOf('* ') + 2));

export const extractCommitsMessages = (event: GithubEvent) =>
  pipe(
    Effect.gen(function* () {
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

      return yield* Effect.fail(
        new CommitMessagesExtractionError({
          cause: 'Failed to extract commit message',
        }),
      );
    }),
    Effect.withSpan('extract-commits-messages', { attributes: { event } }),
  );
