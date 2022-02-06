import { getInput } from '@actions/core';
import { mocked } from 'jest-mock';

export const mockGetInputKeywords = (
  shouldDefaultToPatch: 'true' | 'false',
  major: string,
  minor: string,
  patch: string,
): void => {
  mocked(getInput)
    .mockReturnValueOnce(shouldDefaultToPatch)
    .mockReturnValueOnce(major)
    .mockReturnValueOnce(minor)
    .mockReturnValueOnce(patch);
};
