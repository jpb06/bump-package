import { readFileSync } from 'fs';

import { Effect } from 'effect';
import { beforeEach, describe, it, expect, vi, beforeAll } from 'vitest';

import { runPromise } from '../effects/run-promise';
import { mockActionsCore, mockActionsExec } from '../tests/mocks';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

describe('actionWorkflow function', () => {
  const { getInput, setOutput, info, setFailed } = mockActionsCore();
  const { exec } = mockActionsExec();

  beforeEach(() => {
    vi.clearAllMocks();

    getInput.calledWith('major-keywords').mockReturnValue('[Major]:');
    getInput.calledWith('minor-keywords').mockReturnValue('[Minor]:');
    getInput.calledWith('patch-keywords').mockReturnValue('[Patch]:');
  });

  beforeAll(() => {
    exec.mockResolvedValue(0);
    getInput.calledWith('should-default-to-patch').mockReturnValue('true');
    getInput.calledWith('commit-user').mockReturnValue('');
    getInput.calledWith('commit-user-email').mockReturnValue('');
  });

  it('should fail the task if github event data is missing', async () => {
    const errorMessage = 'Oh no';
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const { actionWorkflow } = await import('./action-workflow');

    await expect(() =>
      Effect.runPromise(actionWorkflow),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[NoGithubEvent: Oh no]`);

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      '❌ Failed to get github event data.',
    );
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should not fail if not running on default branch', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      Buffer.from(
        JSON.stringify({
          ref: 'refs/heads/yolo',
          repository: { default_branch: 'main' },
          commits: [{ message: 'yolo' }, { message: 'bro' }],
        }),
      ),
    );

    const { actionWorkflow } = await import('./action-workflow');

    await runPromise(actionWorkflow);

    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      'ℹ️ Task cancelled: not running on default branch.',
    );
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should fail the task if some keywords are missing', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      Buffer.from(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [],
        }),
      ),
    );

    getInput.calledWith('major-keywords').mockReturnValueOnce('');
    getInput.calledWith('minor-keywords').mockReturnValueOnce('');
    getInput.calledWith('patch-keywords').mockReturnValueOnce('');

    const { actionWorkflow } = await import('./action-workflow');

    await expect(() =>
      Effect.runPromise(actionWorkflow),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[InvalidKeywords]`);

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith('❌ Invalid keywords provided.');
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should drop the task if no bump has been requested', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      Buffer.from(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [{ message: 'yolo' }, { message: 'bro' }],
        }),
      ),
    );
    getInput.calledWith('should-default-to-patch').mockReturnValue('false');

    const { actionWorkflow } = await import('./action-workflow');

    await runPromise(actionWorkflow);

    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      'ℹ️ Task cancelled: no version bump requested.',
    );
    expect(setOutput).toHaveBeenCalledWith('bump-performed', false);
  });

  it('should bump the package', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      Buffer.from(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [{ message: '[Major]: yolo' }, { message: 'bro: cool' }],
        }),
      ),
    );

    const { actionWorkflow } = await import('./action-workflow');

    await runPromise(actionWorkflow);

    expect(exec).toHaveBeenCalledTimes(5);
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', true);
  });
});
