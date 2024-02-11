import { readFileSync } from 'fs';

import { error, info } from '@actions/core';

import { GithubEvent } from '../../types/github';

import { extractCommitsMessages } from './extractCommitsMessages';

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
  } catch (err) {
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

  try {
    const messages = extractCommitsMessages(event);

    return {
      messages,
      isDefaultBranch,
      hasErrors: false,
    };
  } catch (err) {
    error(`🔶 No commits found in the github event:`);
    info(JSON.stringify(event, null, 2));

    return { hasErrors: true } as GithubEventData;
  }
};
