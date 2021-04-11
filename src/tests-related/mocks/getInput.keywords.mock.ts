import { mocked } from "ts-jest/utils";

import { getInput } from "@actions/core";

export const mockGetInputKeywords = (
  major: string,
  minor: string,
  patch: string
): void => {
  mocked(getInput)
    .mockReturnValueOnce(major)
    .mockReturnValueOnce(minor)
    .mockReturnValueOnce(patch);
};
