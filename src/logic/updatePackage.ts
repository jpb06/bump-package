import { exec } from "@actions/exec";

import { readPackage } from "./fs/readPackage";
import { getNewVersion } from "./semver/getNewVersion";

export const updatePackage = async (mask: Array<number>): Promise<string> => {
  const packageJson = await readPackage();
  const newVersion = getNewVersion(mask, packageJson.version);

  await exec("yarn version", ["--new-version", newVersion]);

  return newVersion;
};
