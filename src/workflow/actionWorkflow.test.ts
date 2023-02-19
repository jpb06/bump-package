import { info, setFailed, setOutput } from '@actions/core';

import { actionWorkflow } from './actionWorkflow';
import { setGitConfig } from '../logic/git/setGitConfig';
import {
  getGithubEventData,
  GithubEventData,
} from '../logic/inputs/getGithubEventData';
import { getKeywords, Keywords } from '../logic/inputs/getKeywords';
import { getBumpType } from '../logic/semver/getBumpType';
import { updatePackage } from '../logic/updatePackage';

jest.mock('@actions/core');
jest.mock('../logic/git/setGitConfig');
jest.mock('../logic/updatePackage');
jest.mock('../logic/inputs/getKeywords');
jest.mock('../logic/inputs/getGithubEventData');
jest.mock('../logic/semver/getBumpType');

describe('actionWorkflow function', () => {
  afterEach(() => jest.resetAllMocks());

  it('should fail the task if github event data is missing', async () => {
    jest.mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: true,
    } as GithubEventData);

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should drop the task if the action is not run on default branch', async () => {
    jest.mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isDefaultBranch: false,
      messages: [],
    });

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should fail the task if some keywords are missing', async () => {
    jest.mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isDefaultBranch: true,
      messages: [],
    });
    jest.mocked(getKeywords).mockReturnValueOnce({
      areKeywordsInvalid: true,
    } as Keywords);

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should drop the task if no bump has been requested', async () => {
    jest.mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isDefaultBranch: true,
      messages: [],
    });
    jest.mocked(getKeywords).mockReturnValueOnce({
      areKeywordsInvalid: false,
    } as Keywords);
    jest.mocked(getBumpType).mockReturnValueOnce('none');

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      '🔶 Task cancelled: no version bump requested.',
    );
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should bump the package', async () => {
    const bumpType = 'major';
    jest.mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isDefaultBranch: true,
      messages: [],
    });
    jest.mocked(getKeywords).mockReturnValueOnce({
      areKeywordsInvalid: false,
    } as Keywords);
    jest.mocked(getBumpType).mockReturnValueOnce(bumpType);

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledWith(bumpType);
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', true);
  });

  it('should report on errors', async () => {
    const errorMessage = 'Big bad error';
    jest.mocked(getGithubEventData).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await actionWorkflow();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `🔶 Oh no! An error occured: ${errorMessage}`,
    );

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should display a generic error when no message is available', async () => {
    const errorMessage = 'Big bad error';
    jest.mocked(getGithubEventData).mockImplementationOnce(() => {
      throw errorMessage;
    });

    await actionWorkflow();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `🔶 Oh no! An unknown error occured`,
    );

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });
});
