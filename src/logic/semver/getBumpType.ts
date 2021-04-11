import { Keywords } from "../inputs/getKeywords";

export type BumpType = "major" | "minor" | "patch" | "none";

export const getBumpType = (
  messages: Array<string>,
  keywords: Keywords
): BumpType => {
  const isMajorBump = messages.some((mes) =>
    keywords.major.some((key) => mes.startsWith(key))
  );
  if (isMajorBump) {
    return "major";
  }

  const isMinorBump = messages.some((mes) =>
    keywords.minor.some((key) => mes.startsWith(key))
  );
  if (isMinorBump) {
    return "minor";
  }

  const isPatchBump = messages.some((mes) =>
    keywords.patch.some((key) => mes.startsWith(key))
  );
  if (isPatchBump) {
    return "patch";
  }

  return "none";
};
