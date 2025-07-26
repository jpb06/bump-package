import { env } from 'node:process';

import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFn } from 'vitest-mock-extended';

import { InvalidKeywordsError, NoGithubEventError } from '../errors/index.js';
import { makeFsTestLayer } from '../tests/layers/file-system.test-layer.js';
import { mockActionsCore, mockActionsExec } from '../tests/mocks/index.js';

vi.mock('@actions/github', () => ({
  context: {
    actor: 'actor',
  },
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
    delete env.GITHUB_EVENT_PATH;
    const { FsTestLayer } = makeFsTestLayer({});

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(actionWorkflow, Effect.flip, Effect.provide(FsTestLayer));
    const result = await Effect.runPromise(task);

    expect(result).toBeInstanceOf(NoGithubEventError);
    expect(setOutput).toHaveBeenCalledTimes(0);
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

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(actionWorkflow, Effect.provide(FsTestLayer));
    await runPromise(task);

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      'ℹ️ Task cancelled: not running on default branch.',
    );
    expect(setOutput).toHaveBeenCalledTimes(0);
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

    getInput.calledWith('major-keywords').mockReturnValueOnce('');
    getInput.calledWith('minor-keywords').mockReturnValueOnce('');
    getInput.calledWith('patch-keywords').mockReturnValueOnce('');

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(actionWorkflow, Effect.flip, Effect.provide(FsTestLayer));

    const result = await runPromise(task);

    expect(result).toBeInstanceOf(InvalidKeywordsError);

    expect(setOutput).toHaveBeenCalledTimes(0);
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

    getInput.calledWith('should-default-to-patch').mockReturnValue('false');

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(actionWorkflow, Effect.provide(FsTestLayer));
    await runPromise(task);

    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      'ℹ️ Task cancelled: no version bump requested.',
    );
    expect(setOutput).toHaveBeenCalledTimes(0);
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

    getInput.calledWith('cwd').mockReturnValue('.');

    const { actionWorkflow } = await import('./action-workflow.js');

    const task = pipe(actionWorkflow, Effect.provide(FsTestLayer));
    await runPromise(task);

    expect(exec).toHaveBeenCalledTimes(5);
    expect(exec).toHaveBeenNthCalledWith(
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
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', true);
    expect(setOutput).toHaveBeenCalledWith('new-version', newVersion);
  });

  it('should handle sub paths', async () => {
    env.GITHUB_EVENT_PATH = './github-event-path';

    const oldVersion = '1.1.1';
    const newVersion = '2.0.0';

    const cwd = './apps/frontend-app';
    getInput.calledWith('cwd').mockReturnValue(cwd);

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

    const task = pipe(actionWorkflow, Effect.provide(FsTestLayer));
    await runPromise(task);

    expect(exec).toHaveBeenCalledTimes(5);
    expect(exec).toHaveBeenNthCalledWith(
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
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(0);
    expect(setOutput).toHaveBeenCalledWith('bump-performed', true);
    expect(setOutput).toHaveBeenCalledWith('new-version', newVersion);
  });
});
