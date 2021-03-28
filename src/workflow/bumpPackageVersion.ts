import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { setConfig } from "../logic/git/setConfig";
import { updatePackage } from "../logic/updatePackage";

export const bumpPackageVersion = async (): Promise<void> => {
  try {
    const mask = await checkPreConditions();
    if (!mask) {
      return;
    }

    await setConfig();

    await updatePackage(mask);
  } catch (error) {
    return setFailed(`Oh no! An error occured: ${error.message}`);
  }
};
