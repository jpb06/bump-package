import { error, info } from "@actions/core";

import { getGithubEventData } from "./getGithubEventData";

jest.mock("@actions/core");

describe("getGithubEventData function", () => {
  beforeEach(() => jest.resetAllMocks());

  it("should send an error message when there is no github event", async () => {
    process.env.GITHUB_EVENT_PATH = undefined;

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `> Error: Event data could not be retrieved.`
    );
  });

  it("should send an error message when commit messages are missing", async () => {
    process.env.GITHUB_EVENT_PATH = JSON.stringify({
      ref: "refs/heads/pr",
      repository: {
        master_branch: "master",
      },
    });

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `> Error: No commits found in the github event.`
    );
  });

  it("should send an error message if the master branch is missing in repository infos", async () => {
    process.env.GITHUB_EVENT_PATH = JSON.stringify({
      ref: "refs/heads/pr",
      commits: [
        {
          message: "yolo",
        },
      ],
      repository: {},
    });

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `> Error: Unable to get master branch from github event.`
    );
  });

  it("should send an error message if repository infos are missing", async () => {
    process.env.GITHUB_EVENT_PATH = JSON.stringify({
      ref: "refs/heads/pr",
      commits: [
        {
          message: "yolo",
        },
      ],
    });

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `> Error: Unable to get master branch from github event.`
    );
  });

  it("should send an error message if the current branch cannot be defined", async () => {
    process.env.GITHUB_EVENT_PATH = JSON.stringify({
      commits: [
        {
          message: "yolo",
        },
      ],
      repository: {
        master_branch: "master",
      },
    });

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `> Error: Unable to get current branch from github event.`
    );
  });

  it("should return relevant data", async () => {
    process.env.GITHUB_EVENT_PATH = JSON.stringify({
      ref: "refs/heads/master",
      commits: [
        {
          message: "yolo",
        },
        {
          message: "bro",
        },
      ],
      repository: {
        master_branch: "master",
      },
    });

    const { isMasterBranch, messages, hasErrors } = await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(0);

    expect(hasErrors).toBeFalsy();
    expect(isMasterBranch).toBe(true);
    expect(messages).toStrictEqual(["yolo", "bro"]);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it("should send an info when branch is not master", async () => {
    process.env.GITHUB_EVENT_PATH = JSON.stringify({
      ref: "refs/heads/pr",
      commits: [
        {
          message: "yolo",
        },
        {
          message: "bro",
        },
      ],
      repository: {
        master_branch: "master",
      },
    });

    await getGithubEventData();

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Task cancelled: not running on master branch.`
    );
  });
});
