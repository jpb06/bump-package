import { exec } from "@actions/exec";

export const publish = async (
  isPublishRequested: boolean,
  publishFolder: string
): Promise<void> => {
  if (isPublishRequested) {
    await exec(`cd ./${publishFolder} && yarn publish`);
  }
};
