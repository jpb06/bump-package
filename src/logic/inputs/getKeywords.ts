import { error, getInput } from "@actions/core";

export interface Keywords {
  major: Array<string>;
  minor: Array<string>;
  patch: Array<string>;
  hasErrors: boolean;
}

const isEmpty = (array: Array<string>) =>
  array.length === 1 && array[0].length === 0;

export const getKeywords = (): Keywords => {
  const keywords = ["major", "minor", "patch"].map((type) => {
    const array = getInput(`${type}-keywords`).split(",");
    if (isEmpty(array)) {
      error(`> Error: Expecting at least one ${type} keyword but got 0.`);
    }
    return array;
  });

  return {
    major: keywords[0],
    minor: keywords[1],
    patch: keywords[2],
    hasErrors: keywords.some((el) => isEmpty(el)),
  };
};
