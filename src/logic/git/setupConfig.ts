import simpleGit from "simple-git";

import { context } from "@actions/github";

export const setupConfig = async (): Promise<void> => {
  const git = simpleGit({ baseDir: process.cwd() });

  await git
    .addConfig("user.name", `${context.actor}`, true)
    .addConfig("user.email", `${context.actor}@users.noreply.github.com`, true);
};
