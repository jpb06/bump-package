import { readFileSync } from "fs";
import { mocked } from "ts-jest/utils";

import { error, info } from "@actions/core";

import { getGithubEventData } from "./getGithubEventData";

jest.mock("@actions/core");
jest.mock("fs");

describe("getGithubEventData function", () => {
  beforeEach(() => jest.resetAllMocks());

  it("should send an error message when there is no github event", async () => {
    mocked(readFileSync).mockReturnValueOnce("");

    const result = await getGithubEventData();

    expect(result.hasErrors).toBe(true);
  });

  it("should send an error message when commit messages are missing", async () => {
    mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: "refs/heads/pr",
        repository: {
          master_branch: "master",
        },
      })
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(`No commits found in the github event.`);
  });

  it("should send an error message if the master branch is missing in repository infos", async () => {
    mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: "refs/heads/pr",
        commits: [
          {
            message: "yolo",
          },
        ],
        repository: {},
      })
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `Unable to get master branch from github event.`
    );
  });

  it("should send an error message if repository infos are missing", async () => {
    mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        ref: "refs/heads/pr",
        commits: [
          {
            message: "yolo",
          },
        ],
      })
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `Unable to get master branch from github event.`
    );
  });

  it("should send an error message if the current branch cannot be defined", async () => {
    mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
        commits: [
          {
            message: "yolo",
          },
        ],
        repository: {
          master_branch: "master",
        },
      })
    );

    await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      `Unable to get current branch from github event.`
    );
  });

  it("should return relevant data", async () => {
    mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
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
      })
    );

    const { isMasterBranch, messages, hasErrors } = await getGithubEventData();

    expect(error).toHaveBeenCalledTimes(0);

    expect(hasErrors).toBeFalsy();
    expect(isMasterBranch).toBe(true);
    expect(messages).toStrictEqual(["yolo", "bro"]);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it("should send an info when branch is not master", async () => {
    mocked(readFileSync).mockReturnValueOnce(
      JSON.stringify({
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
      })
    );

    await getGithubEventData();

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Task cancelled: not running on master branch.`
    );
  });
});
