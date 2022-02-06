import { readFileSync } from 'fs';

import { error, info } from '@actions/core';

import { GithubEvent } from '../../types/github';

export interface GithubEventData {
  messages: Array<string>;
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
  } catch (err) {
    return { hasErrors: true } as GithubEventData;
  }

  const messages = Array.isArray(event.commits)
    ? event.commits.map((el) => el.message)
    : [];
  const defaultBranch = event.repository?.default_branch;
  const currentBranch = event.ref?.split('/').slice(2).join('/');

  let hasErrors = false;
  if (messages.length === 0) {
    error(`🔶 No commits found in the github event.`);
    hasErrors = true;
  }
  if (!defaultBranch || defaultBranch.length === 0) {
    error(`🔶 Unable to get default branch from github event.`);
    hasErrors = true;
  }
  if (!currentBranch || currentBranch.length === 0) {
    error(`🔶 Unable to get current branch from github event.`);
    hasErrors = true;
  }

  const isDefaultBranch = currentBranch === defaultBranch;
  if (!isDefaultBranch) {
    info(`🔶 Task cancelled: not running on ${defaultBranch} branch.`);
  }

  return { messages, isDefaultBranch, hasErrors };
};
