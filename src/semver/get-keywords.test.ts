import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvalidKeywordsError } from '../errors/index.js';
import { mockActionsCore } from '../tests/mocks/index.js';

vi.mock('@actions/core');

describe('getKeywords function', () => {
  const { getInput, error } = mockActionsCore();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send an error message three times', async () => {
    getInput.calledWith('should-default-to-patch').mockReturnValueOnce('false');
    getInput.calledWith('major-keywords').mockReturnValueOnce('');
    getInput.calledWith('minor-keywords').mockReturnValueOnce('');
    getInput.calledWith('patch-keywords').mockReturnValueOnce('');

    const { getKeywords } = await import('./get-keywords.js');

    const result = await runPromise(pipe(getKeywords, Effect.flip));

    expect(result).toBeInstanceOf(InvalidKeywordsError);

    expect(error).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenNthCalledWith(
      1,
      '⚠️ Expecting at least one major keyword but got 0.',
    );
    expect(error).toHaveBeenNthCalledWith(
      2,
      '⚠️ Expecting at least one minor keyword but got 0.',
    );
    expect(error).toHaveBeenNthCalledWith(
      3,
      '⚠️ Expecting at least one patch keyword but got 0.',
    );
  });

  it('should return inputs', async () => {
    getInput.calledWith('should-default-to-patch').mockReturnValueOnce('false');
    getInput.calledWith('major-keywords').mockReturnValueOnce('yolo,bro');
    getInput.calledWith('minor-keywords').mockReturnValueOnce('cool,man,fun');
    getInput.calledWith('patch-keywords').mockReturnValueOnce('super');

    const { getKeywords } = await import('./get-keywords.js');

    const result = await runPromise(getKeywords);

    expect(error).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(['yolo', 'bro']);
    expect(result.minor).toStrictEqual(['cool', 'man', 'fun']);
    expect(result.patch).toStrictEqual(['super']);
    expect(result.shouldDefaultToPatch).toBe(false);
  });

  it('should ignore patch keywords validation is defaulting to patch', async () => {
    getInput.calledWith('should-default-to-patch').mockReturnValueOnce('true');
    getInput.calledWith('major-keywords').mockReturnValueOnce('yolo,bro');
    getInput.calledWith('minor-keywords').mockReturnValueOnce('cool,man,fun');
    getInput.calledWith('patch-keywords').mockReturnValueOnce('');

    const { getKeywords } = await import('./get-keywords.js');

    const result = await runPromise(getKeywords);

    expect(error).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(['yolo', 'bro']);
    expect(result.minor).toStrictEqual(['cool', 'man', 'fun']);
    expect(result.patch).toStrictEqual(['']);
    expect(result.shouldDefaultToPatch).toBe(true);
  });
});
