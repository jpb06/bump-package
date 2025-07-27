import { env } from 'node:process';

import { Effect, Layer, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFn } from 'vitest-mock-extended';

import { InvalidKeywordsError, NoGithubEventError } from '../errors/index.js';
import { makeFsTestLayer } from '../tests/layers/file-system.test-layer.js';
import { makeGithubActionsTestLayer } from '../tests/layers/github-actions.test-layer.js';

describe('actionWorkflow function', () => {
  const getInputMock = mockFn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();

    getInputMock.calledWith('cwd').mockReturnValue(Effect.succeed('.'));
    getInputMock.calledWith('debug').mockReturnValue(Effect.succeed('false'));
    getInputMock
      .calledWith('should-default-to-patch')
      .mockReturnValue(Effect.succeed('true'));
    getInputMock.calledWith('commit-user').mockReturnValue(Effect.succeed(''));
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValue(Effect.succeed(''));
    getInputMock
      .calledWith('major-keywords')
      .mockReturnValue(Effect.succeed('[Major]:'));
    getInputMock
      .calledWith('minor-keywords')
      .mockReturnValue(Effect.succeed('[Minor]:'));
    getInputMock
      .calledWith('patch-keywords')
      .mockReturnValue(Effect.succeed('[Patch]:'));
  });

  it('should fail the task if github event data is missing', async () => {
    delete env.GITHUB_EVENT_PATH;

    const { FsTestLayer } = makeFsTestLayer({});
    const { GithubActionsTestLayer, setOutputMock } =
      makeGithubActionsTestLayer({
        getInput: getInputMock,
        setOutput: Effect.void,
      });

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(
      actionWorkflow,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    const result = await Effect.runPromise(task);

    expect(result).toBeInstanceOf(NoGithubEventError);
    expect(setOutputMock).toHaveBeenCalledTimes(0);
  });

  it('should not fail if not running on default branch', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';

    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/yolo',
          repository: { default_branch: 'main' },
          commits: [{ message: 'yolo' }, { message: 'bro' }],
        }),
      ),
    });
    const { GithubActionsTestLayer, setOutputMock, infoMock } =
      makeGithubActionsTestLayer({
        exec: Effect.succeed(0),
        getInput: getInputMock,
        info: Effect.void,
        setOutput: Effect.void,
      });

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(
      actionWorkflow,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    await runPromise(task);

    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock).toHaveBeenCalledWith(
      'ℹ️ Task cancelled: not running on default branch.',
    );
    expect(setOutputMock).toHaveBeenCalledTimes(0);
  });

  it('should fail the task if some keywords are missing', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';

    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [],
        }),
      ),
    });

    getInputMock
      .calledWith('major-keywords')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('minor-keywords')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('patch-keywords')
      .mockReturnValueOnce(Effect.succeed(''));
    const { GithubActionsTestLayer, setOutputMock, errorMock } =
      makeGithubActionsTestLayer({
        error: Effect.void,
        exec: Effect.succeed(0),
        getContext: Effect.succeed({ actor: 'actor' }),
        getInput: getInputMock,
        info: Effect.void,
        setOutput: Effect.void,
      });

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(
      actionWorkflow,
      Effect.flip,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );

    const result = await runPromise(task);

    expect(result).toBeInstanceOf(InvalidKeywordsError);

    expect(errorMock).toHaveBeenCalledTimes(2);
    expect(errorMock).toHaveBeenNthCalledWith(
      1,
      '⚠️ Expecting at least one minor keyword but got 0.',
      undefined,
    );
    expect(errorMock).toHaveBeenNthCalledWith(
      2,
      '⚠️ Expecting at least one major keyword but got 0.',
      undefined,
    );

    expect(setOutputMock).toHaveBeenCalledTimes(0);
  });

  it('should drop the task if no bump has been requested', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';
    const { FsTestLayer } = makeFsTestLayer({
      readFileString: Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [{ message: 'yolo' }, { message: 'bro' }],
        }),
      ),
    });

    getInputMock
      .calledWith('should-default-to-patch')
      .mockReturnValue(Effect.succeed('false'));
    const {
      GithubActionsTestLayer,
      setFailedMock,
      setOutputMock,
      errorMock,
      infoMock,
    } = makeGithubActionsTestLayer({
      error: Effect.void,
      exec: Effect.succeed(0),
      getContext: Effect.succeed({ actor: 'actor' }),
      getInput: getInputMock,
      info: Effect.void,
      setFailed: Effect.void,
      setOutput: Effect.void,
    });

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(
      actionWorkflow,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    await runPromise(task);

    expect(setFailedMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock).toHaveBeenCalledWith(
      'ℹ️ Task cancelled: no version bump requested.',
    );
    expect(errorMock).toHaveBeenCalledTimes(0);
    expect(setOutputMock).toHaveBeenCalledTimes(0);
  });

  it('should bump the package', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';

    const newVersion = '2.0.0';
    const readFileStringMock = mockFn();
    readFileStringMock.calledWith(env.GITHUB_EVENT_PATH).mockReturnValue(
      Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [{ message: '[Major]: yolo' }, { message: 'bro: cool' }],
        }),
      ),
    );
    readFileStringMock
      .calledWith('./package.json')
      .mockReturnValue(Effect.succeed(`{ "version": "${newVersion}" }`));

    const { FsTestLayer } = makeFsTestLayer({
      readFileString: readFileStringMock,
    });

    const {
      GithubActionsTestLayer,
      execMock,
      setFailedMock,
      setOutputMock,
      errorMock,
      infoMock,
    } = makeGithubActionsTestLayer({
      error: Effect.void,
      exec: Effect.succeed(0),
      getContext: Effect.succeed({ actor: 'actor' }),
      getInput: getInputMock,
      info: Effect.void,
      setFailed: Effect.void,
      setOutput: Effect.void,
    });

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(
      actionWorkflow,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    await runPromise(task);

    expect(execMock).toHaveBeenCalledTimes(5);
    expect(execMock).toHaveBeenNthCalledWith(
      3,
      'npm version',
      [
        'major',
        '--force',
        '--tag-version-prefix=v',
        '--m',
        'chore: bump version to %s',
      ],
      { cwd: '.' },
    );
    expect(setFailedMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(0);
    expect(errorMock).toHaveBeenCalledTimes(0);
    expect(setOutputMock).toHaveBeenCalledWith('bump-performed', true);
    expect(setOutputMock).toHaveBeenCalledWith('new-version', newVersion);
  });

  it('should handle sub paths', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';

    const oldVersion = '1.1.1';
    const newVersion = '2.0.0';

    const cwd = './apps/frontend-app';
    getInputMock.calledWith('cwd').mockReturnValue(Effect.succeed(cwd));
    const {
      GithubActionsTestLayer,
      execMock,
      setFailedMock,
      setOutputMock,
      errorMock,
      infoMock,
    } = makeGithubActionsTestLayer({
      error: Effect.void,
      exec: Effect.succeed(0),
      getContext: Effect.succeed({ actor: 'actor' }),
      getInput: getInputMock,
      info: Effect.void,
      setFailed: Effect.void,
      setOutput: Effect.void,
    });

    const readFileStringMock = mockFn();
    readFileStringMock.calledWith(env.GITHUB_EVENT_PATH).mockReturnValue(
      Effect.succeed(
        JSON.stringify({
          ref: 'refs/heads/main',
          repository: { default_branch: 'main' },
          commits: [{ message: '[Major]: yolo' }, { message: 'bro: cool' }],
        }),
      ),
    );
    readFileStringMock
      .calledWith('apps/frontend-app/package.json')
      .mockReturnValueOnce(
        Effect.succeed(
          `{ "name": "frontend-app", "version": "${oldVersion}" }`,
        ),
      )
      .mockReturnValueOnce(
        Effect.succeed(
          `{ "name": "frontend-app", "version": "${newVersion}" }`,
        ),
      );

    const { FsTestLayer } = makeFsTestLayer({
      readFileString: readFileStringMock,
    });

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(
      actionWorkflow,
      Effect.provide(Layer.mergeAll(FsTestLayer, GithubActionsTestLayer)),
    );
    await runPromise(task);

    expect(execMock).toHaveBeenCalledTimes(5);
    expect(execMock).toHaveBeenNthCalledWith(
      3,
      'npm version',
      [
        'major',
        '--force',
        '--tag-version-prefix=frontend-app@v',
        '--m',
        'chore(frontend-app): bump version to %s',
      ],
      { cwd: './apps/frontend-app' },
    );
    expect(setFailedMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(0);
    expect(errorMock).toHaveBeenCalledTimes(0);
    expect(setOutputMock).toHaveBeenCalledWith('bump-performed', true);
    expect(setOutputMock).toHaveBeenCalledWith('new-version', newVersion);
  });
});
