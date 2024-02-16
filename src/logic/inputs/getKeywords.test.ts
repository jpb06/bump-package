import { error } from '@actions/core';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { mockGetInputKeywords } from '../../tests-related/mocks/getInput.keywords.mock';

import { getKeywords } from './getKeywords';

vi.mock('@actions/core');

describe('getKeywords function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send an error message three times', () => {
    mockGetInputKeywords('false', '', '', '');

    const result = getKeywords();

    expect(error).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenNthCalledWith(
      1,
      `❌ Expecting at least one major keyword but got 0.`,
    );
    expect(error).toHaveBeenNthCalledWith(
      2,
      `❌ Expecting at least one minor keyword but got 0.`,
    );
    expect(error).toHaveBeenNthCalledWith(
      3,
      `❌ Expecting at least one patch keyword but got 0.`,
    );

    expect(result.major).toStrictEqual(['']);
    expect(result.minor).toStrictEqual(['']);
    expect(result.patch).toStrictEqual(['']);
    expect(result.shouldDefaultToPatch).toBe(false);
    expect(result.areKeywordsInvalid).toBe(true);
  });

  it('should return inputs', () => {
    mockGetInputKeywords('false', 'yolo,bro', 'cool,man,fun', 'super');

    const result = getKeywords();

    expect(error).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(['yolo', 'bro']);
    expect(result.minor).toStrictEqual(['cool', 'man', 'fun']);
    expect(result.patch).toStrictEqual(['super']);
    expect(result.shouldDefaultToPatch).toBe(false);
    expect(result.areKeywordsInvalid).toBe(false);
  });

  it('should ignore patch keywords validation is defaulting to patch', () => {
    mockGetInputKeywords('true', 'yolo,bro', 'cool,man,fun', '');

    const result = getKeywords();

    expect(error).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(['yolo', 'bro']);
    expect(result.minor).toStrictEqual(['cool', 'man', 'fun']);
    expect(result.patch).toStrictEqual(['']);
    expect(result.shouldDefaultToPatch).toBe(true);
    expect(result.areKeywordsInvalid).toBe(false);
  });
});
