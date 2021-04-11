import { info, setFailed } from "@actions/core";

import { setGitConfig } from "../logic/git/setGitConfig";
import { getGithubEventData } from "../logic/inputs/getGithubEventData";
import { getKeywords } from "../logic/inputs/getKeywords";
import { getBumpType } from "../logic/semver/getBumpType";
import { updatePackage } from "../logic/updatePackage";

export const actionWorkflow = async (): Promise<void> => {
  try {
    const keywords = getKeywords();
    if (keywords.hasErrors) {
      return setFailed(`> Error: Event data could not be retrieved.`);
    }

    const { messages, hasErrors, isMasterBranch } = await getGithubEventData();
    if (hasErrors) {
      return setFailed("> Error: Github event fetching failure");
    }

    if (!isMasterBranch) {
      return;
    }

    const bumpType = getBumpType(messages, keywords);
    if (bumpType === "none") {
      info("> Task cancelled: no version bump requested.");
      return;
    }

    await setGitConfig();
    await updatePackage(bumpType);
  } catch (error) {
    return setFailed(`Oh no! An error occured: ${error.message}`);
  }
};
