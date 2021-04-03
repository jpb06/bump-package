import { pathExists } from "fs-extra";

import { getInput, info, warning } from "@actions/core";

import { getHeadCommitMessage } from "./git/getHeadCommitMessage";
import { buildMask } from "./semver/buildMask";

interface Inputs {
  mask: Array<number>;
  isPublishRequested: boolean;
  publishFolder: string;
}

export const checkPreConditions = async (): Promise<Inputs | undefined> => {
  const keywords = getInput("keywords").split(",");
  if (keywords.length !== 3) {
    warning(
      `> Task cancelled: expecting 3 keywords but got ${keywords.length}. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );
    return undefined;
  }

  const publishFolder = getInput("publish-root");
  const isPublishRequested = getInput("publish") === "true";
  if (isPublishRequested) {
    const token = process.env.NODE_AUTH_TOKEN;
    if (!token || token.length === 0) {
      warning(`> Task cancelled: no npm token provided.`);
      return undefined;
    }

    const exists =
      publishFolder === "." ? true : await pathExists(`./${publishFolder}`);
    if (!exists) {
      warning(
        `> Task cancelled: the folder to publish is missing. Did you forget to build the package before calling this action?`
      );
      return undefined;
    }
  }

  const commitMessage = await getHeadCommitMessage();
  if (!commitMessage || commitMessage.length === 0) {
    warning(`> Task cancelled: no HEAD commit message found.`);
    return undefined;
  }

  const mask = buildMask(commitMessage, keywords);
  if (!mask.includes(1)) {
    info("> Task cancelled: no version bump requested.");
    return undefined;
  }

  return { mask, isPublishRequested, publishFolder };
};
