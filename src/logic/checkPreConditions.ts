import { getInput, info } from "@actions/core";

import { getHeadCommitMessage } from "./git/getHeadCommitMessage";
import { buildMask } from "./semver/buildMask";

export interface Inputs {
  mask: Array<number>;
  isPublishRequested: boolean;
  publishFolder: string;

  error?: string;
  isActionNeeded?: boolean;
}

const res = (error?: string, isActionNeeded?: boolean): Inputs => ({
  mask: [],
  isPublishRequested: false,
  publishFolder: ".",
  error,
  isActionNeeded,
});

export const checkPreConditions = async (): Promise<Inputs> => {
  const keywords = getInput("keywords").split(",");
  if (keywords.length !== 3) {
    return res(
      `> Task cancelled: expecting 3 keywords but got ${keywords.length}. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );
  }

  const publishFolder = getInput("publish-root");
  const isPublishRequested = getInput("publish") === "true";
  if (isPublishRequested) {
    const token = process.env.NODE_AUTH_TOKEN || "";
    if (token.length === 0) {
      return res(
        `> Task cancelled: no npm token provided to publish the package.`
      );
    }
  }

  const commitMessage = await getHeadCommitMessage();
  if (!commitMessage || commitMessage.length === 0) {
    return res(`> Task cancelled: no HEAD commit message found.`);
  }

  const mask = buildMask(commitMessage, keywords);
  if (!mask.includes(1)) {
    info("> Task cancelled: no version bump requested.");
    return res();
  }

  return { mask, isPublishRequested, publishFolder, isActionNeeded: true };
};
