import { info, setFailed } from '@actions/core';

import { setGitConfig } from '../logic/git/setGitConfig';
import { getGithubEventData } from '../logic/inputs/getGithubEventData';
import { getKeywords } from '../logic/inputs/getKeywords';
import { getBumpType } from '../logic/semver/getBumpType';
import { updatePackage } from '../logic/updatePackage';

export const actionWorkflow = async (): Promise<void> => {
  try {
    const { messages, hasErrors, isDefaultBranch } = await getGithubEventData();
    if (hasErrors) {
      return setFailed('> Error: Github event fetching failure');
    }

    if (!isDefaultBranch) {
      return;
    }

    const { areKeywordsInvalid, ...keywords } = getKeywords();
    if (areKeywordsInvalid) {
      return setFailed(`> Error: Invalid keyword inputs provided.`);
    }

    const bumpType = getBumpType(messages, keywords);
    if (bumpType === 'none') {
      return info('> Task cancelled: no version bump requested.');
    }

    await setGitConfig();
    await updatePackage(bumpType);
  } catch (error) {
    if (error instanceof Error) {
      return setFailed(
        `Oh no! An error occured: ${(error as { message: string }).message}`,
      );
    }

    return setFailed(`Oh no! An unknown error occured`);
  }
};
