import { mocked } from "ts-jest/utils";

import { execFile } from "../shell/execFile";
import { getHeadCommitMessage } from "./getHeadCommitMessage";

jest.mock("../shell/execFile");

describe("getHeadCommitMessage function", () => {
  it("should return a commit message", async () => {
    const commitMessage = "yolo";
    process.env.GITHUB_REF = "refs/heads/feature-branch-1";
    mocked(execFile).mockResolvedValueOnce({
      stdout: commitMessage,
      stderr: "",
    });

    const result = await getHeadCommitMessage();

    expect(result).toBe(commitMessage);
  });

  it("should return undefined if GITHUB_REF is undefined", async () => {
    process.env.GITHUB_REF = undefined;

    const result = await getHeadCommitMessage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if GITHUB_REF is empty", async () => {
    process.env.GITHUB_REF = "";

    const result = await getHeadCommitMessage();

    expect(result).toBeUndefined();
  });
});
