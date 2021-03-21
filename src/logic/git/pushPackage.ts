import simpleGit from "simple-git";

import { info } from "@actions/core";

export const pushPackage = async (version: string): Promise<void> => {
  const git = simpleGit({ baseDir: process.cwd() });

  info(`> Pushing new version ...`);
  await git
    .add("./package.json")
    .commit(`[bump-package]: bumping package version to ${version}`)
    .push();
};
