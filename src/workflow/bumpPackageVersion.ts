import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { setConfig } from "../logic/git/setConfig";
import { updatePackage } from "../logic/updatePackage";
import { publish } from "../logic/yarn/publish";

export const bumpPackageVersion = async (): Promise<void> => {
  try {
    const inputs = await checkPreConditions();
    if (!inputs) {
      return;
    }

    await setConfig();
    await updatePackage(inputs.mask);
    await publish(inputs.isPublishRequested, inputs.publishFolder);
  } catch (error) {
    return setFailed(`Oh no! An error occured: ${error.message}`);
  }
};
