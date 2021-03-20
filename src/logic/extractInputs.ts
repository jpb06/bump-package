import { getInput } from "@actions/core";

import { Inputs } from "../types/inputs";

export const extractInputs = (): Inputs => {
  const branch = getInput("branch");
  const rawKeywords = getInput("keywords");

  return {
    branch,
    rawKeywords,
  };
};
