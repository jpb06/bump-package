import { readFileSync } from 'fs';

import { error, info } from '@actions/core';

import { GithubEvent } from '../../types/github';

import { extractCommitsMessages } from './extractCommitsMessages';
import { getCurrentBranch } from './getCurrentBranch';

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

  const currentBranch = getCurrentBranch(event);

  const isDefaultBranch = currentBranch === defaultBranch;
  if (!isDefaultBranch) {
    info(`🔶 Task cancelled: not running on ${defaultBranch} branch.`);
    return { hasErrors: true } as GithubEventData;
  }

  const messages = extractCommitsMessages(event);

  return {
    messages,
    isDefaultBranch,
    hasErrors: false,
  };
};
