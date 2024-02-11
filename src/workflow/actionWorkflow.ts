import { info, setFailed, setOutput } from '@actions/core';

import { setGitConfig } from '../logic/git/setGitConfig';
import { getGithubEventData } from '../logic/inputs/getGithubEventData';
import { getKeywords } from '../logic/inputs/getKeywords';
import { getBumpType } from '../logic/semver/getBumpType';
import { updatePackage } from '../logic/updatePackage';

export const actionWorkflow = async (): Promise<void> => {
  try {
    const { messages, hasErrors, isDefaultBranch } = await getGithubEventData();
    if (hasErrors) {
      setOutput('bump-performed', false);
      return setFailed('🔶 Error: Github event fetching failure');
    }

    if (!isDefaultBranch) {
      setOutput('bump-performed', false);
      return;
    }

    const { areKeywordsInvalid, ...keywords } = getKeywords();
    if (areKeywordsInvalid) {
      setOutput('bump-performed', false);
      return setFailed(`🔶 Error: Invalid keyword inputs provided.`);
    }

    const bumpType = getBumpType(messages, keywords);
    if (bumpType === 'none') {
      setOutput('bump-performed', false);
      return info('🔶 Task cancelled: no version bump requested.');
    }

    await setGitConfig();
    await updatePackage(bumpType);

    setOutput('bump-performed', true);
  } catch (error) {
    setOutput('bump-performed', false);
    if (error instanceof Error) {
      if (error.message.startsWith('🔶')) {
        return setFailed(error.message);
      }

      return setFailed(
        `🔶 Oh no! An error occured: ${(error as { message: string }).message}`,
      );
    }

    return setFailed(`🔶 Oh no! An unknown error occured`);
  }
};
