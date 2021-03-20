import simpleGit from "simple-git";

export const getHeadCommitMessage = async (
  branch: string
): Promise<string | undefined> => {
  const git = simpleGit({
    baseDir: process.cwd(),
  });

  const result = await git.log([branch, "-1", "--pretty=%B"]);

  return result.latest?.hash;
};
