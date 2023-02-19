import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';

import { setGitConfig } from './setGitConfig';

jest.mock('@actions/core')
jest.mock('@actions/exec');
jest.mock('@actions/github');

describe('setGitConfig function', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should set git config with default values', async () => {
    jest.mocked(getInput).mockReturnValueOnce("").mockReturnValueOnce("")

    await setGitConfig();

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.name',
      context.actor,
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.email',
      `${context.actor}@users.noreply.github.com`,
    ]);
  });

  it('should set git config with a custom user', async () => {
    const email = "yolo@cool.org"
    const name = "Yolo Bro"
    jest.mocked(getInput).mockReturnValueOnce(email).mockReturnValueOnce(name)

    await setGitConfig();

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.name',
      name
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.email',
      email
    ]);
  });
});
