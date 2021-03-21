import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { pushPackage } from "../logic/git/pushPackage";
import { setupConfig } from "../logic/git/setupConfig";
import { updatePackage } from "../logic/updatePackage";

export const bumpPackageVersion = async (): Promise<void> => {
  try {
    const mask = await checkPreConditions();
    if (!mask) {
      return;
    }

    await setupConfig();

    const version = await updatePackage(mask);
    await pushPackage(version);
  } catch (error) {
    return setFailed(`Oh no! An error occured: ${error.message}`);
  }
};
