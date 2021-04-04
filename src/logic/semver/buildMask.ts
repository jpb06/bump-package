export const buildMask = (
  commitMessage: string,
  keywords: Array<string>
): Array<number> =>
  Array.from(
    { length: 3 },
    (_, index) => +commitMessage.startsWith(keywords[index])
  );
