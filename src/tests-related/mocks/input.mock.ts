import { mocked } from "ts-jest/utils";

import { getInput } from "@actions/core";

export const mockInputs = (branch: string, keywords: string): void => {
  mocked(getInput).mockReturnValueOnce(branch).mockReturnValueOnce(keywords);
};
