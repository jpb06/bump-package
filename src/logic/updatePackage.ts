import { info } from "@actions/core";

import { readPackage } from "./fs/readPackage";
import { writePackage } from "./fs/writePackage";
import { getNewVersion } from "./semver/getNewVersion";

export const updatePackage = async (mask: Array<number>): Promise<string> => {
  const packageJson = await readPackage();
  const newVersion = getNewVersion(mask, packageJson.version);

  await writePackage(packageJson, newVersion);

  info(`> Version has been bumped to ${newVersion}`);

  return newVersion;
};
