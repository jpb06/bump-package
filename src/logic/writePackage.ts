import { writeJson } from "fs-extra";

import { Versionable } from "../types/versionable";

export const writePackage = async (
  packageJson: Versionable,
  newVersion: string
): Promise<void> => {
  await writeJson("./package.json", {
    ...packageJson,
    version: newVersion,
  });
};
