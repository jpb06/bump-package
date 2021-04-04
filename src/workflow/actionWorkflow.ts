import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { setConfig } from "../logic/git/setConfig";
import { updatePackage } from "../logic/updatePackage";
import { publish } from "../logic/yarn/publish";

export const actionWorkflow = async (): Promise<void> => {
  try {
    const {
      error,
      isActionNeeded,
      isPublishRequested,
      publishFolder,
      mask,
    } = await checkPreConditions();

    if (error) {
      return setFailed(error);
    }
    if (!isActionNeeded) {
      return;
    }

    await setConfig();
    await updatePackage(mask);
    await publish(isPublishRequested, publishFolder);
  } catch (error) {
    return setFailed(`Oh no! An error occured: ${error.message}`);
  }
};
