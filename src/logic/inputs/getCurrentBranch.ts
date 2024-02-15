import { info } from '@actions/core';

import { GithubEvent } from '../../types/github';

export const getCurrentBranch = (event: GithubEvent) => {
  if (event?.ref !== undefined) {
    return event.ref?.split('/').slice(2).join('/');
  }

  if (event?.workflow_run?.head_branch !== undefined) {
    return event.workflow_run.head_branch;
  }

  throw new Error('❌ Unable to get current branch from github event.');
};
