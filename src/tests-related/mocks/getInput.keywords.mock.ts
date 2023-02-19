import { getInput } from '@actions/core';

export const mockGetInputKeywords = (
  shouldDefaultToPatch: 'true' | 'false',
  major: string,
  minor: string,
  patch: string,
): void => {
  jest.mocked(getInput)
    .mockReturnValueOnce(shouldDefaultToPatch)
    .mockReturnValueOnce(major)
    .mockReturnValueOnce(minor)
    .mockReturnValueOnce(patch);
};
