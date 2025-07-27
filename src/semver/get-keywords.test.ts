import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFn } from 'vitest-mock-extended';

import { InvalidKeywordsError } from '../errors/index.js';
import { makeGithubActionsTestLayer } from '../tests/layers/github-actions.test-layer.js';

describe('getKeywords function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send an error message three times', async () => {
    const getInputMock = mockFn();
    getInputMock
      .calledWith('should-default-to-patch')
      .mockReturnValueOnce(Effect.succeed('false'));
    getInputMock
      .calledWith('major-keywords')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('minor-keywords')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('patch-keywords')
      .mockReturnValueOnce(Effect.succeed(''));

    const { GithubActionsTestLayer, errorMock } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: getInputMock,
    });

    const { getKeywords } = await import('./get-keywords.js');

    const task = pipe(
      getKeywords,
      Effect.flip,
      Effect.provide(GithubActionsTestLayer),
    );
    const result = await runPromise(task);

    expect(result).toBeInstanceOf(InvalidKeywordsError);

    expect(errorMock).toHaveBeenCalledTimes(3);
    expect(errorMock).toHaveBeenNthCalledWith(
      1,
      '⚠️ Expecting at least one patch keyword but got 0.',
      undefined,
    );
    expect(errorMock).toHaveBeenNthCalledWith(
      2,
      '⚠️ Expecting at least one minor keyword but got 0.',
      undefined,
    );
    expect(errorMock).toHaveBeenNthCalledWith(
      3,
      '⚠️ Expecting at least one major keyword but got 0.',
      undefined,
    );
  });

  it('should return inputs', async () => {
    const getInputMock = mockFn();
    getInputMock
      .calledWith('should-default-to-patch')
      .mockReturnValueOnce(Effect.succeed('false'));
    getInputMock
      .calledWith('major-keywords')
      .mockReturnValueOnce(Effect.succeed('yolo,bro'));
    getInputMock
      .calledWith('minor-keywords')
      .mockReturnValueOnce(Effect.succeed('cool,man,fun'));
    getInputMock
      .calledWith('patch-keywords')
      .mockReturnValueOnce(Effect.succeed('super'));

    const { GithubActionsTestLayer, errorMock } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: getInputMock,
    });

    const { getKeywords } = await import('./get-keywords.js');

    const task = pipe(getKeywords, Effect.provide(GithubActionsTestLayer));
    const result = await runPromise(task);

    expect(errorMock).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(['yolo', 'bro']);
    expect(result.minor).toStrictEqual(['cool', 'man', 'fun']);
    expect(result.patch).toStrictEqual(['super']);
    expect(result.shouldDefaultToPatch).toBe(false);
  });

  it('should ignore patch keywords validation is defaulting to patch', async () => {
    const getInputMock = mockFn();

    getInputMock
      .calledWith('should-default-to-patch')
      .mockReturnValueOnce(Effect.succeed('true'));
    getInputMock
      .calledWith('major-keywords')
      .mockReturnValueOnce(Effect.succeed('yolo,bro'));
    getInputMock
      .calledWith('minor-keywords')
      .mockReturnValueOnce(Effect.succeed('cool,man,fun'));
    getInputMock
      .calledWith('patch-keywords')
      .mockReturnValueOnce(Effect.succeed(''));

    const { GithubActionsTestLayer, errorMock } = makeGithubActionsTestLayer({
      error: Effect.void,
      getInput: getInputMock,
    });

    const { getKeywords } = await import('./get-keywords.js');

    const task = pipe(getKeywords, Effect.provide(GithubActionsTestLayer));
    const result = await runPromise(task);

    expect(errorMock).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(['yolo', 'bro']);
    expect(result.minor).toStrictEqual(['cool', 'man', 'fun']);
    expect(result.patch).toStrictEqual([]);
    expect(result.shouldDefaultToPatch).toBe(true);
  });
});
