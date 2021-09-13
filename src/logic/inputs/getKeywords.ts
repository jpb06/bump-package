import { error, getInput } from '@actions/core';

export interface Keywords {
  major: Array<string>;
  minor: Array<string>;
  patch: Array<string>;
  areKeywordsInvalid: boolean;
  shouldDefaultToPatch: boolean;
}

const isEmpty = (array: Array<string>) =>
  array.length === 1 && array[0].length === 0;

export const getKeywords = (): Keywords => {
  const shouldDefaultToPatch = getInput(`should-default-to-patch`) === 'true';
  const keywords = ['major', 'minor', 'patch'].map((type, index) => {
    const array = getInput(`${type}-keywords`).split(',');
    if (
      (index === 2 && !shouldDefaultToPatch && isEmpty(array)) ||
      (index !== 2 && isEmpty(array))
    ) {
      error(`> Expecting at least one ${type} keyword but got 0.`);
    }
    return array;
  });

  const areKeywordsInvalid = shouldDefaultToPatch
    ? keywords.slice(0, -1).some((el) => isEmpty(el))
    : keywords.some((el) => isEmpty(el));

  return {
    shouldDefaultToPatch,
    major: keywords[0],
    minor: keywords[1],
    patch: keywords[2],
    areKeywordsInvalid,
  };
};
