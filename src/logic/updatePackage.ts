import { exec } from "@actions/exec";
import { context } from "@actions/github";

import { readPackage } from "./fs/readPackage";
import { getNewVersion } from "./semver/getNewVersion";

export const updatePackage = async (mask: Array<number>): Promise<string> => {
  const packageJson = await readPackage();
  const newVersion = getNewVersion(mask, packageJson.version);

  await exec("git config", ["--global", "user.name", context.actor]);
  await exec("git config", [
    "--global",
    "user.email",
    `${context.actor}@users.noreply.github.com`,
  ]);
  await exec("yarn version", ["--new-version", newVersion]);

  return newVersion;
};
