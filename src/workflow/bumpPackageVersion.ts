import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { pushNewVersion } from "../logic/git/pushPackage";
import { updatePackage } from "../logic/updatePackage";

export const bumpPackageVersion = async (): Promise<void> => {
  try {
    const mask = await checkPreConditions();
    if (!mask) {
      return;
    }

    const version = await updatePackage(mask);
    await pushNewVersion(version);
  } catch (error) {
    return setFailed(`Oh no! An error occured: ${error.message}`);
  }
};
