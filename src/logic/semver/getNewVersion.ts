export const getNewVersion = (mask: Array<number>, version: string): string => {
  let hasBeenBumped = false;
  const newVersion = version
    .split(".")
    .map((el) => +el)
    .reduce((prev, curr, index) => {
      let value = curr;
      if (hasBeenBumped) {
        value = 0;
      }
      if (mask[index] === 1) {
        value++;
        hasBeenBumped = true;
      }

      if (index === 0) {
        return `${value}`;
      }

      return `${prev}.${value}`;
    }, "");

  return newVersion;
};
