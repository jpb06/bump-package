import { Keywords } from '../inputs/getKeywords';

export type BumpType = 'major' | 'minor' | 'patch' | 'none';

const isBumpRequestedFor = (keywords: Array<string>, messages: Array<string>) =>
  messages.some((mes) => keywords.some((key) => mes.startsWith(key)));

export const getBumpType = (
  messages: Array<string>,
  keywords: Omit<Keywords, 'areKeywordsInvalid'>,
): BumpType => {
  const isMajorBump = isBumpRequestedFor(keywords.major, messages);
  if (isMajorBump) {
    return 'major';
  }

  const isMinorBump = isBumpRequestedFor(keywords.minor, messages);
  if (isMinorBump) {
    return 'minor';
  }

  if (keywords.shouldDefaultToPatch) {
    return 'patch';
  }

  const isPatchBump = isBumpRequestedFor(keywords.patch, messages);
  if (isPatchBump) {
    return 'patch';
  }

  return 'none';
};
