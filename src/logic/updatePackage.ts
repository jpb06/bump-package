import { getInput } from "@actions/core";
import { exec } from "@actions/exec";

import { BumpType } from "./semver/getBumpType";

export const updatePackage = async (bumpType: BumpType): Promise<void> => {
  const isTaggingRequested = getInput("create-tag") === "true";

  const npmVersionArguments: Array<string> = [bumpType];
  if (isTaggingRequested) {
    npmVersionArguments.push("--force");
  } else {
    npmVersionArguments.push("--no-git-tag-version");
  }

  await exec("npm version", npmVersionArguments);
  await exec("git push");

  if (isTaggingRequested) {
    await exec("git push", ["--tags"]);
  }
};
