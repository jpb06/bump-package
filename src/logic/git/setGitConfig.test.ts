import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { setGitConfig } from './setGitConfig';

vi.mock('@actions/core');
vi.mock('@actions/exec');
vi.mock('@actions/github');

describe('setGitConfig function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set git config with default values', async () => {
    vi.mocked(getInput).mockReturnValueOnce('').mockReturnValueOnce('');

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
    const email = 'yolo@cool.org';
    const name = 'Yolo Bro';
    vi.mocked(getInput).mockReturnValueOnce(email).mockReturnValueOnce(name);

    await setGitConfig();

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.name',
      name,
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.email',
      email,
    ]);
  });
});
