import { info, setFailed, warning } from "@actions/core";

import { buildMask } from "../logic/buildMask";
import { extractInputs } from "../logic/extractInputs";
import { getHeadCommitMessage } from "../logic/getHeadCommitMessage";
import { getNewVersion } from "../logic/getNewVersion";
import { pushNewVersion } from "../logic/gitPushPackage";
import { readPackage } from "../logic/readPackage";
import { writePackage } from "../logic/writePackage";

export const bumpPackageVersion = async (): Promise<void> => {
  try {
    const { branch, rawKeywords } = extractInputs();

    const commitMessage = await getHeadCommitMessage(branch);
    if (!commitMessage || commitMessage.length === 0) {
      return warning(`> Task dropped: no HEAD commit message found.`);
    }

    const keywords = rawKeywords.split(",");
    if (keywords.length !== 3) {
      return warning(
        `> Task dropped: expecting 3 keywords but got ${keywords.length}. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
      );
    }

    const mask = buildMask(commitMessage, keywords);
    if (!mask.includes(1)) {
      return info("> Task dropped: no version bump requested.");
    }

    const packageJson = await readPackage();
    const newVersion = getNewVersion(mask, packageJson.version);

    await writePackage(packageJson, newVersion);

    info(`> Version has been bumped to ${newVersion}`);

    await pushNewVersion(newVersion);
  } catch (error) {
    return setFailed(error.message);
  }
};
