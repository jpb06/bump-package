import { error, info } from "@actions/core";

import { GithubEvent } from "../../types/github";

export interface GithubEventData {
  messages: Array<string>;
  isMasterBranch: boolean;
  hasErrors?: boolean;
}

export const getGithubEventData = async (): Promise<GithubEventData> => {
  let event: GithubEvent;
  try {
    event = await JSON.parse(process.env.GITHUB_EVENT_PATH as string);
  } catch (err) {
    error(`> Error: Event data could not be retrieved.`);
    return { hasErrors: true } as GithubEventData;
  }

  const messages = Array.isArray(event.commits)
    ? event.commits.map((el) => el.message)
    : [];
  const masterBranch = event.repository?.master_branch;
  const currentBranch = event.ref?.split("/").slice(2).join("/");

  let hasErrors = false;
  if (messages.length === 0) {
    error(`> Error: No commits found in the github event.`);
    hasErrors = true;
  }
  if (!masterBranch || masterBranch.length === 0) {
    error(`> Error: Unable to get master branch from github event.`);
    hasErrors = true;
  }
  if (!currentBranch || currentBranch.length === 0) {
    error(`> Error: Unable to get current branch from github event.`);
    hasErrors = true;
  }

  const isMasterBranch = currentBranch === masterBranch;
  if (!isMasterBranch) {
    info(`> Task cancelled: not running on ${masterBranch} branch.`);
  }

  return { messages, isMasterBranch, hasErrors };
};
