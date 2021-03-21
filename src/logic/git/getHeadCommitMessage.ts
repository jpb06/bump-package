import simpleGit from "simple-git";

import { getBranchName } from "./getBranchName";

export const getHeadCommitMessage = async (): Promise<string | undefined> => {
  const git = simpleGit({
    baseDir: process.cwd(),
  });

  const branch = getBranchName();
  if (!branch) {
    return undefined;
  }

  const result = await git.log([branch, "-1", "--pretty=%B"]);

  return result.latest?.hash;
};
