import { mockSimpleGit } from "../tests-related/mocks/simpleGit.mock";
import { getHeadCommitMessage } from "./getHeadCommitMessage";

jest.mock("simple-git");

describe("getHeadCommitMessage function", () => {
  it("should return a commit message", async () => {
    const commitMessage = "yolo";
    mockSimpleGit({ latest: { hash: commitMessage } });

    const result = await getHeadCommitMessage("master");

    expect(result).toBe(commitMessage);
  });

  it("should return undefined if commit message could not be retrieved", async () => {
    mockSimpleGit({});

    const result = await getHeadCommitMessage("master");

    expect(result).toBeUndefined();
  });
});
