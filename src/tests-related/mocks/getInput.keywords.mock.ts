import { getInput } from "@actions/core";
import { mocked } from "ts-jest/utils";

export const mockGetInputKeywords = (
  shouldDefaultToPatch: "true" | "false",
  major: string,
  minor: string,
  patch: string
): void => {
  mocked(getInput)
    .mockReturnValueOnce(shouldDefaultToPatch)
    .mockReturnValueOnce(major)
    .mockReturnValueOnce(minor)
    .mockReturnValueOnce(patch);
};
