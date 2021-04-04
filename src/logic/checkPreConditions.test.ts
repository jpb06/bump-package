import { mocked } from "ts-jest/utils";

import { getInput, info } from "@actions/core";

import { checkPreConditions } from "./checkPreConditions";
import { getHeadCommitMessage } from "./git/getHeadCommitMessage";
import { buildMask } from "./semver/buildMask";

jest.mock("@actions/core");
jest.mock("./git/getHeadCommitMessage");
jest.mock("./semver/buildMask");

describe("checkPreConditions function", () => {
  afterEach(() => jest.clearAllMocks());

  it("should drop the task if not enough keywords were provided", async () => {
    mocked(getInput).mockReturnValueOnce("a");

    const result = await checkPreConditions();

    expect(result).toStrictEqual({
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
      error: `> Task cancelled: expecting 3 keywords but got 1. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`,
      isActionNeeded: undefined,
    });
  });

  it("should drop the task if publish was requested and no npm token has been provided", async () => {
    delete process.env.NODE_AUTH_TOKEN;
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce("dist")
      .mockReturnValueOnce("true");

    const result = await checkPreConditions();

    expect(result).toStrictEqual({
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
      error: `> Task cancelled: no npm token provided to publish the package.`,
      isActionNeeded: undefined,
    });
  });

  it("should drop the task if publish was requested and the provided npm token is empty", async () => {
    process.env.NODE_AUTH_TOKEN = "";
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce("dist")
      .mockReturnValueOnce("true");

    const result = await checkPreConditions();

    expect(result).toStrictEqual({
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
      error: `> Task cancelled: no npm token provided to publish the package.`,
      isActionNeeded: undefined,
    });
  });

  it("should drop the task if last commit could not be provided", async () => {
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce("dist")
      .mockReturnValueOnce("false");
    mocked(getHeadCommitMessage).mockResolvedValueOnce(undefined);

    const result = await checkPreConditions();

    expect(result).toStrictEqual({
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
      error: `> Task cancelled: no HEAD commit message found.`,
      isActionNeeded: undefined,
    });
  });

  it("should drop the task if no bump was requested", async () => {
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce(".")
      .mockReturnValueOnce("false");

    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");
    mocked(buildMask).mockReturnValueOnce([0, 0, 0]);

    const result = await checkPreConditions();

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Task cancelled: no version bump requested.`
    );

    expect(result).toStrictEqual({
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
      isActionNeeded: undefined,
      error: undefined,
    });
  });

  it("should return the mask", async () => {
    const mask = [1, 0, 0];
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce(".")
      .mockReturnValueOnce("false");

    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");
    mocked(buildMask).mockReturnValueOnce(mask);

    const result = await checkPreConditions();

    expect(info).toHaveBeenCalledTimes(0);

    expect(result).toStrictEqual({
      mask,
      isPublishRequested: false,
      publishFolder: ".",
      isActionNeeded: true,
    });
  });

  it("should return the mask (publish case)", async () => {
    process.env.NODE_AUTH_TOKEN = "yolo";
    const mask = [1, 0, 0];
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce(".")
      .mockReturnValueOnce("true");

    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");
    mocked(buildMask).mockReturnValueOnce(mask);

    const result = await checkPreConditions();

    expect(info).toHaveBeenCalledTimes(0);

    expect(result).toStrictEqual({
      mask,
      isPublishRequested: true,
      publishFolder: ".",
      isActionNeeded: true,
    });
  });
});
