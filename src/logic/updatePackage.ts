import { exec } from "@actions/exec";

import { BumpType } from "./semver/getBumpType";

export const updatePackage = async (bumpType: BumpType): Promise<void> => {
  await exec("npm version", [bumpType]);
  await exec("git push");
  await exec("git push", ["--tags"]);
};
