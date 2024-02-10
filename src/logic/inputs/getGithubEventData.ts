import { readFileSync } from 'fs';

import { error, info } from '@actions/core';

import { GithubEvent } from '../../types/github';

export interface GithubEventData {
  messages: string[];
  isDefaultBranch: boolean;
  hasErrors: boolean;
}

export const getGithubEventData = async (): Promise<GithubEventData> => {
  let event: GithubEvent;
  try {
    event = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH as string, {
        encoding: 'utf8',
      }),
    );
    console.log(event);
  } catch (err) {
    return { hasErrors: true } as GithubEventData;
  }

  if (!Array.isArray(event.commits) || event.commits.length === 0) {
    error(`🔶 No commits found in the github event.`);
    return { hasErrors: true } as GithubEventData;
  }

  const defaultBranch = event.repository?.default_branch;
  if (!defaultBranch || defaultBranch.length === 0) {
    error(`🔶 Unable to get default branch from github event.`);
    return { hasErrors: true } as GithubEventData;
  }

  const currentBranch = event.ref?.split('/').slice(2).join('/');
  if (!currentBranch || currentBranch.length === 0) {
    error(`🔶 Unable to get current branch from github event.`);
    return { hasErrors: true } as GithubEventData;
  }

  const isDefaultBranch = currentBranch === defaultBranch;
  if (!isDefaultBranch) {
    info(`🔶 Task cancelled: not running on ${defaultBranch} branch.`);
    return { hasErrors: true } as GithubEventData;
  }

  const isSquashCommit =
    event.commits.length === 1 &&
    event.commits[0].committer.name === 'GitHub' &&
    event.commits[0].distinct === true;

  if (isSquashCommit) {
    const message = event.commits[0].message;
    const squashedMessages = message
      .substring(message.indexOf('*'))
      .split('\r\n\r\n')
      .map((el) => el.substring(el.indexOf('* ') + 2));

    return {
      hasErrors: false,
      messages: squashedMessages,
      isDefaultBranch,
    };
  }

  return {
    messages: event.commits.map((el) => el.message),
    isDefaultBranch,
    hasErrors: false,
  };
};
