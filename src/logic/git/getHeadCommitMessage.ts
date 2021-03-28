import { execFile } from "../shell/execFile";
import { getBranchName } from "./getBranchName";

export const getHeadCommitMessage = async (): Promise<string | undefined> => {
  const branch = getBranchName();
  if (!branch) {
    return undefined;
  }

  const { stdout: commitMessage } = await execFile("git log", [
    branch,
    "-1",
    "--pretty=%B",
  ]);

  return commitMessage;
};
