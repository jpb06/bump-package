import { readFileSync } from 'fs';

import { error, info } from '@actions/core';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { getGithubEventData } from './getGithubEventData';

vi.mock('@actions/core');
vi.mock('fs', () => ({
  promises: { access: vi.fn() },
  readFileSync: vi.fn(),
}));

describe('getGithubEventData function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send an error message when there is no github event', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce('');

    const result = await getGithubEventData();

    expect(result.hasErrors).toBe(true);
  });

  it('should send an error message when commit messages are missing', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: 'refs/heads/master',
        repository: {
          default_branch: 'master',
        },
      }),
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `🔶 No commits found in the github event:`,
    );
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('should send an error message if the default branch is missing in repository infos', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: 'refs/heads/pr',
        commits: [
          {
            message: 'yolo',
          },
        ],
        repository: {},
      }),
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `🔶 Unable to get default branch from github event.`,
    );
  });

  it('should send an error message if repository infos are missing', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: 'refs/heads/pr',
        commits: [
          {
            message: 'yolo',
          },
        ],
      }),
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `🔶 Unable to get default branch from github event.`,
    );
  });

  it('should send an error message if the current branch cannot be defined', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        commits: [
          {
            message: 'yolo',
          },
        ],
        repository: {
          default_branch: 'master',
        },
      }),
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `🔶 Unable to get current branch from github event.`,
    );
  });

  it('should return relevant data', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: 'refs/heads/master',
        commits: [
          {
            message: 'yolo',
          },
          {
            message: 'bro',
          },
        ],
        repository: {
          default_branch: 'master',
        },
      }),
    );

    const { isDefaultBranch, messages, hasErrors } = await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(0);

    expect(hasErrors).toBeFalsy();
    expect(isDefaultBranch).toBe(true);
    expect(messages).toStrictEqual(['yolo', 'bro']);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it('should return squashed commits messages', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: 'refs/heads/master',
        commits: [
          {
            message:
              '3 (#3)\n\n* useless\r\n\r\n* chore: displaying event\r\n\r\n* yolo',
            committer: {
              name: 'GitHub',
            },
            distinct: true,
          },
        ],
        repository: {
          default_branch: 'master',
        },
      }),
    );

    const { isDefaultBranch, messages, hasErrors } = await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(0);

    expect(hasErrors).toBeFalsy();
    expect(isDefaultBranch).toBe(true);
    expect(messages).toStrictEqual([
      'useless',
      'chore: displaying event',
      'yolo',
    ]);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it('should send an info when branch is not master', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: 'refs/heads/pr',
        commits: [
          {
            message: 'yolo',
          },
          {
            message: 'bro',
          },
        ],
        repository: {
          default_branch: 'master',
        },
      }),
    );

    await getGithubEventData();

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `🔶 Task cancelled: not running on master branch.`,
    );
  });
});
