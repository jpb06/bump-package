import { readFileSync } from 'node:fs';

import { error, getInput, info } from '@actions/core';
import { Effect, pipe } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommitMessagesExtractionError } from '../../errors/commit-messages-extraction.error';
import { NoGithubEventError } from '../../errors/no-github-event.error';
import { NotRunningOnDefaultBranchError } from '../../errors/not-running-on-default-branch.error';
import { UnknownCurrentBranchError } from '../../errors/unknown-current-branch.error';
import { UnknownDefaultBranchError } from '../../errors/unknown-default-branch.error';

import { runPromise } from 'effect-errors';
import { getGithubEventData } from './get-github-event-data';

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
    vi.mocked(readFileSync).mockReturnValueOnce({} as never);

    const result = await runPromise(pipe(getGithubEventData, Effect.flip));
    expect(result).toBeInstanceOf(NoGithubEventError);
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

    const result = await runPromise(pipe(getGithubEventData, Effect.flip));

    expect(result).toBeInstanceOf(UnknownDefaultBranchError);
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

    const result = await runPromise(pipe(getGithubEventData, Effect.flip));

    expect(result).toBeInstanceOf(UnknownDefaultBranchError);
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

    const result = await runPromise(pipe(getGithubEventData, Effect.flip));

    expect(result).toBeInstanceOf(UnknownCurrentBranchError);
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

    const result = await runPromise(pipe(getGithubEventData, Effect.flip));

    expect(result).toBeInstanceOf(CommitMessagesExtractionError);
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

    const messages = await runPromise(getGithubEventData);

    expect(error).toHaveBeenCalledTimes(0);

    expect(messages).toStrictEqual(['yolo', 'bro']);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it('should display github event in debug mode', async () => {
    const event = {
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
    };
    vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify(event));
    vi.mocked(getInput).mockReturnValueOnce('true');

    await runPromise(getGithubEventData);

    expect(error).toHaveBeenCalledTimes(0);

    expect(info).toHaveBeenCalledTimes(2);
    expect(info).toHaveBeenNthCalledWith(1, '🕵️ Github event:');
    expect(info).toHaveBeenNthCalledWith(2, JSON.stringify(event, null, 2));
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

    const messages = await runPromise(getGithubEventData);

    expect(error).toHaveBeenCalledTimes(0);

    expect(messages).toStrictEqual([
      'useless',
      'chore: displaying event',
      'yolo',
    ]);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it('should return squashed commits messages from a completed workflow event', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        action: 'completed',
        workflow_run: {
          head_branch: 'master',
          head_commit: {
            message:
              '3 (#3)\n\n* useless\r\n\r\n* chore: displaying event\r\n\r\n* yolo',
          },
        },
        repository: {
          default_branch: 'master',
        },
      }),
    );

    const messages = await runPromise(getGithubEventData);

    expect(error).toHaveBeenCalledTimes(0);

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

    const result = await runPromise(pipe(getGithubEventData, Effect.flip));

    expect(result).toBeInstanceOf(NotRunningOnDefaultBranchError);
  });
});
