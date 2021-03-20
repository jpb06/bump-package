import simpleGit, { SimpleGit } from "simple-git";
import { mocked } from "ts-jest/utils";

interface SimpleGitMock {
  addConfig: jest.Mock<unknown>;
  add: jest.Mock<unknown>;
  commit: jest.Mock<unknown>;
  push: jest.Mock<unknown>;
  addTag: jest.Mock<unknown>;
  pushTags: jest.Mock<unknown>;
  log: jest.Mock<unknown>;
}

export const mockSimpleGit = (logResult?: unknown): SimpleGitMock => {
  const addConfig = jest.fn().mockReturnThis();
  const add = jest.fn().mockReturnThis();
  const commit = jest.fn().mockReturnThis();
  const push = jest.fn().mockReturnThis();
  const addTag = jest.fn().mockReturnThis();
  const pushTags = jest.fn().mockReturnThis();
  const log = jest.fn().mockReturnValueOnce(logResult);

  mocked(simpleGit).mockReturnValue(({
    addConfig,
    add,
    commit,
    push,
    addTag,
    pushTags,
    log,
  } as unknown) as SimpleGit);

  return {
    addConfig,
    add,
    commit,
    push,
    addTag,
    pushTags,
    log,
  };
};
