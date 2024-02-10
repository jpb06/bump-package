import { getInput } from '@actions/core';
import { vi } from 'vitest';

export const mockGetInputKeywords = (
  shouldDefaultToPatch: 'true' | 'false',
  major: string,
  minor: string,
  patch: string,
): void => {
  vi.mocked(getInput)
    .mockReturnValueOnce(shouldDefaultToPatch)
    .mockReturnValueOnce(major)
    .mockReturnValueOnce(minor)
    .mockReturnValueOnce(patch);
};
