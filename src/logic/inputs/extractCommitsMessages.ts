import { GithubEvent } from '../../types/github';

const extractSquashCommitMessage = (message: string) =>
  message
    .substring(message.indexOf('*'))
    .split('\r\n\r\n')
    .map((el) => el.substring(el.indexOf('* ') + 2));

export const extractCommitsMessages = (event: GithubEvent) => {
  if (
    Array.isArray(event.commits) &&
    event.commits.length === 1 &&
    event.commits[0].committer.name === 'GitHub' &&
    event.commits[0].distinct === true
  ) {
    return extractSquashCommitMessage(event.commits[0].message);
  }

  if (event.workflow_run?.head_commit?.message !== undefined) {
    return extractSquashCommitMessage(event.workflow_run.head_commit.message);
  }

  if (Array.isArray(event.commits)) {
    return event.commits.map((el) => el.message);
  }

  throw new Error('No commits found in the github event');
};
