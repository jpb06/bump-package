import { mockSimpleGit } from "../../tests-related/mocks/simpleGit.mock";
import { getHeadCommitMessage } from "./getHeadCommitMessage";

jest.mock("simple-git");

describe("getHeadCommitMessage function", () => {
  it("should return a commit message", async () => {
    const commitMessage = "yolo";
    process.env.GITHUB_REF = "refs/heads/feature-branch-1";

    mockSimpleGit({ latest: { hash: commitMessage } });

    const result = await getHeadCommitMessage();

    expect(result).toBe(commitMessage);
  });

  it("should return undefined if hash does not exist", async () => {
    process.env.GITHUB_REF = "refs/heads/feature-branch-1";

    mockSimpleGit({});

    const result = await getHeadCommitMessage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if GITHUB_REF is undefined", async () => {
    mockSimpleGit({});
    process.env.GITHUB_REF = undefined;

    const result = await getHeadCommitMessage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if GITHUB_REF is empty", async () => {
    mockSimpleGit({});
    process.env.GITHUB_REF = "";

    const result = await getHeadCommitMessage();

    expect(result).toBeUndefined();
  });
});
