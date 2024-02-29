import { context } from '@actions/github';
import { describe, it, beforeEach, expect, vi, beforeAll } from 'vitest';

import { runPromise } from '../effects/run-promise';
import { mockActionsCore, mockActionsExec } from '../tests/mocks';

vi.mock('@actions/github', () => ({
  context: {
    actor: 'actor',
  },
}));

describe('setGitConfig function', () => {
  const { exec } = mockActionsExec();
  const { getInput } = mockActionsCore();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    exec.mockResolvedValue(0);
  });

  it('should set git config with default values', async () => {
    getInput.calledWith('commit-user-email').mockReturnValueOnce('');
    getInput.calledWith('commit-user').mockReturnValueOnce('');

    const { setGitConfig } = await import('./set-git-config');

    await runPromise(setGitConfig);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.email',
      `${context.actor}@users.noreply.github.com`,
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.name',
      context.actor,
    ]);
  });

  it('should set git config with a custom user', async () => {
    const email = 'yolo@cool.org';
    const name = 'Yolo Bro';
    getInput.calledWith('commit-user-email').mockReturnValueOnce(email);
    getInput.calledWith('commit-user').mockReturnValueOnce(name);

    const { setGitConfig } = await import('./set-git-config');

    await runPromise(setGitConfig);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.email',
      email,
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.name',
      name,
    ]);
  });
});
