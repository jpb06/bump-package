import simpleGit from "simple-git";

import { info } from "@actions/core";
import { context } from "@actions/github";

export const pushPackage = async (version: string): Promise<void> => {
  const git = simpleGit({ baseDir: process.cwd() });

  info(`> Pushing new version ...`);
  await git
    .addConfig("user.name", `${context.actor}`)
    .addConfig("user.email", `${context.actor}@users.noreply.github.com`)
    .add("./package.json")
    .commit(`[bump-package]: bumping package version to ${version}`)
    .push();
};
