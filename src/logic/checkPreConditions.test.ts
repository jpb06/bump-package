import { pathExists } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { getInput, info, warning } from "@actions/core";

import { checkPreConditions } from "./checkPreConditions";
import { getHeadCommitMessage } from "./git/getHeadCommitMessage";
import { buildMask } from "./semver/buildMask";

jest.mock("@actions/core");
jest.mock("fs-extra");
jest.mock("./git/getHeadCommitMessage");
jest.mock("./semver/buildMask");

describe("checkPreConditions function", () => {
  afterEach(() => jest.clearAllMocks());

  it("should drop the task if not enough keywords were provided", async () => {
    mocked(getInput).mockReturnValueOnce("a");

    const result = await checkPreConditions();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task cancelled: expecting 3 keywords but got 1. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );

    expect(result).toBeUndefined();
  });

  it("should drop the task if publish was requested and no npm token has been provided", async () => {
    process.env.NODE_AUTH_TOKEN = "";
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce("dist")
      .mockReturnValueOnce("true");

    const result = await checkPreConditions();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task cancelled: no npm token provided.`
    );

    expect(result).toBeUndefined();
  });

  it("should drop the task if the folder to publish does not exist", async () => {
    process.env.NODE_AUTH_TOKEN = "yolo";
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce("dist")
      .mockReturnValueOnce("true");
    mocked(pathExists).mockImplementationOnce(() => false);

    const result = await checkPreConditions();

    expect(pathExists).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task cancelled: the folder to publish is missing. Did you forget to build the package before calling this action?`
    );

    expect(result).toBeUndefined();
  });

  it("should not check if publish folder exists if path equals '.'", async () => {
    process.env.NODE_AUTH_TOKEN = "yolo";
    mocked(getInput)
      .mockReturnValueOnce("a,b,c")
      .mockReturnValueOnce(".")
      .mockReturnValueOnce("true");
    mocked(pathExists).mockImplementationOnce(() => false);

    await checkPreConditions();
    expect(pathExists).toHaveBeenCalledTimes(0);
  });

  it("should drop the task if last commit could not be provided", async () => {
    mocked(getInput).mockReturnValueOnce("a,b,c");
    mocked(getHeadCommitMessage).mockResolvedValueOnce(undefined);

    const result = await checkPreConditions();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task cancelled: no HEAD commit message found.`
    );

    expect(result).toBeUndefined();
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

    expect(result).toBeUndefined();
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
    });
  });
});
