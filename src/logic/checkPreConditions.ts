import { getInput, info, warning } from "@actions/core";

import { getHeadCommitMessage } from "./git/getHeadCommitMessage";
import { buildMask } from "./semver/buildMask";

export const checkPreConditions = async (): Promise<
  Array<number> | undefined
> => {
  const keywords = getInput("keywords").split(",");
  if (keywords.length !== 3) {
    warning(
      `> Task dropped: expecting 3 keywords but got ${keywords.length}. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );
    return undefined;
  }

  const commitMessage = await getHeadCommitMessage();
  if (!commitMessage || commitMessage.length === 0) {
    warning(`> Task dropped: no HEAD commit message found.`);
    return undefined;
  }

  const mask = buildMask(commitMessage, keywords);
  if (!mask.includes(1)) {
    info("> Task dropped: no version bump requested.");
    return undefined;
  }

  return mask;
};
