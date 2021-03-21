import { readJson } from "fs-extra";

import { Versionable } from "../../types/versionable";

export const readPackage = async (): Promise<Versionable> => {
  const data = await readJson("./package.json");

  return data;
};
