import { env } from 'node:process';

import { Effect, Layer, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFn } from 'vitest-mock-extended';

import {
  CommitMessagesExtractionError,
  NoGithubEventError,
  NotRunningOnDefaultBranchError,
  UnknownCurrentBranchError,
  UnknownDefaultBranchError,
} from '../../errors/index.js';
import { makeFsTestLayer } from '../../tests/layers/file-system.test-layer.js';
import { makeGithubActionsTestLayer } from '../../tests/layers/github-actions.test-layer.js';
import { getGithubEventData } from './get-github-event-data.js';

describe('getGithubEventData function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send an error message when there is no github event', async () => {
    delete env.GITHUB_EVENT_PATH;
    const { FsTestLayer } = makeFsTestLayer({});
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      error: Effect.void,
    });

    const program = pipe(
      getGithubEventData,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    const result = await runPromise(program);
    expect(result).toBeInstanceOf(NoGithubEventError);
  });

  it('should send an error message if the default branch is missing in repository infos', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/pr',
          commits: [
            {
              message: 'yolo',
            },
          ],
          repository: {},
        }),
      ),
    });
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: Effect.succeed(''),
    });

    const program = pipe(
      getGithubEventData,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    const result = await runPromise(program);

    expect(result).toBeInstanceOf(UnknownDefaultBranchError);
  });

  it('should send an error message if repository infos are missing', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/pr',
          commits: [
            {
              message: 'yolo',
            },
          ],
        }),
      ),
    });
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: Effect.succeed(''),
    });

    const task = pipe(
      getGithubEventData,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const result = await runPromise(task);

    expect(result).toBeInstanceOf(UnknownDefaultBranchError);
  });

  it('should send an error message if the current branch cannot be defined', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
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
      ),
    });
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: Effect.succeed(''),
    });

    const program = pipe(
      getGithubEventData,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    const result = await runPromise(program);

    expect(result).toBeInstanceOf(UnknownCurrentBranchError);
  });

  it('should send an error message when commit messages are missing', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/master',
          repository: {
            default_branch: 'master',
          },
        }),
      ),
    });
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: Effect.succeed(''),
    });

    const program = pipe(
      getGithubEventData,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const result = await runPromise(program);

    expect(result).toBeInstanceOf(CommitMessagesExtractionError);
  });

  it('should return relevant data', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
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
      ),
    });
    const { GithubActionsTestLayer, errorMock, infoMock } =
      makeGithubActionsTestLayer({
        error: Effect.void,
        info: Effect.void,
        getInput: Effect.succeed(''),
      });

    const program = pipe(
      getGithubEventData,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const messages = await runPromise(program);

    expect(errorMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(0);
    expect(messages).toStrictEqual(['yolo', 'bro']);
  });

  it('should display github event in debug mode', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
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
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(JSON.stringify(event)),
    });

    const { GithubActionsTestLayer, errorMock, infoMock } =
      makeGithubActionsTestLayer({
        error: Effect.void,
        info: Effect.void,
        getInput: mockFn().mockReturnValueOnce(Effect.succeed('true')),
      });

    const program = pipe(
      getGithubEventData,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    await runPromise(program);

    expect(errorMock).toHaveBeenCalledTimes(0);

    expect(infoMock).toHaveBeenCalledTimes(2);
    expect(infoMock).toHaveBeenNthCalledWith(1, '🕵️ Github event:');
    expect(infoMock).toHaveBeenNthCalledWith(2, JSON.stringify(event, null, 2));
  });

  it('should return squashed commits messages', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
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
      ),
    });
    const { GithubActionsTestLayer, errorMock, infoMock } =
      makeGithubActionsTestLayer({
        error: Effect.void,
        info: Effect.void,
        getInput: Effect.succeed(''),
      });

    const program = pipe(
      getGithubEventData,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const messages = await runPromise(program);

    expect(errorMock).toHaveBeenCalledTimes(0);

    expect(messages).toStrictEqual([
      'useless',
      'chore: displaying event',
      'yolo',
    ]);
    expect(infoMock).toHaveBeenCalledTimes(0);
  });

  it('should return squashed commits messages from a completed workflow event', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
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
      ),
    });
    const { GithubActionsTestLayer, errorMock, infoMock } =
      makeGithubActionsTestLayer({
        error: Effect.void,
        info: Effect.void,
        getInput: Effect.succeed(''),
      });

    const program = pipe(
      getGithubEventData,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const messages = await runPromise(program);

    expect(errorMock).toHaveBeenCalledTimes(0);

    expect(messages).toStrictEqual([
      'useless',
      'chore: displaying event',
      'yolo',
    ]);
    expect(infoMock).toHaveBeenCalledTimes(0);
  });

  it('should send an info when branch is not master', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
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
      ),
    });
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      error: Effect.void,
      info: Effect.void,
      getInput: Effect.succeed(''),
    });

    const program = pipe(
      getGithubEventData,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const result = await Effect.runPromise(program);

    expect(result).toBeInstanceOf(NotRunningOnDefaultBranchError);
  });
});
