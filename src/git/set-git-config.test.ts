import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFn } from 'vitest-mock-extended';

import { makeGithubActionsTestLayer } from '../tests/layers/github-actions.test-layer.js';

describe('setGitConfig function', () => {
  const context = { actor: 'actor' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set git config with default values', async () => {
    const getInputMock = mockFn();
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('commit-user')
      .mockReturnValueOnce(Effect.succeed(''));
    const { GithubActionsTestLayer, execMock } = makeGithubActionsTestLayer({
      getContext: Effect.succeed(context),
      exec: Effect.succeed(0),
      getInput: getInputMock,
    });

    const { setGitConfig } = await import('./set-git-config.js');

    const program = pipe(setGitConfig, Effect.provide(GithubActionsTestLayer));
    await runPromise(program);

    expect(execMock).toHaveBeenCalledTimes(2);
    expect(execMock).toHaveBeenNthCalledWith(
      1,
      'git config',
      ['--global', 'user.email', `${context.actor}@users.noreply.github.com`],
      undefined,
    );
    expect(execMock).toHaveBeenNthCalledWith(
      2,
      'git config',
      ['--global', 'user.name', context.actor],
      undefined,
    );
  });

  it('should set git config with a custom user', async () => {
    const email = 'yolo@cool.org';
    const name = 'Yolo Bro';

    const getInputMock = mockFn();
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValueOnce(Effect.succeed(email));
    getInputMock
      .calledWith('commit-user')
      .mockReturnValueOnce(Effect.succeed(name));
    const { GithubActionsTestLayer, execMock } = makeGithubActionsTestLayer({
      getContext: Effect.succeed(context),
      exec: Effect.succeed(0),
      getInput: getInputMock,
    });

    const { setGitConfig } = await import('./set-git-config.js');

    const program = pipe(setGitConfig, Effect.provide(GithubActionsTestLayer));
    await runPromise(program);

    expect(execMock).toHaveBeenCalledTimes(2);
    expect(execMock).toHaveBeenNthCalledWith(
      1,
      'git config',
      ['--global', 'user.email', email],
      undefined,
    );
    expect(execMock).toHaveBeenNthCalledWith(
      2,
      'git config',
      ['--global', 'user.name', name],
      undefined,
    );
  });
});
