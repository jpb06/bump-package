import { mocked } from "ts-jest/utils";

import { getInput, info, warning } from "@actions/core";

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

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task dropped: expecting 3 keywords but got 1. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );

    expect(result).toBeUndefined();
  });

  it("should drop the task if last commit could not be provided", async () => {
    mocked(getInput).mockReturnValueOnce("a,b,c");
    mocked(getHeadCommitMessage).mockResolvedValueOnce(undefined);

    const result = await checkPreConditions();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task dropped: no HEAD commit message found.`
    );

    expect(result).toBeUndefined();
  });

  it("should drop the task if no bump was requested", async () => {
    mocked(getInput).mockReturnValueOnce("a,b,c");
    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");
    mocked(buildMask).mockReturnValueOnce([0, 0, 0]);

    const result = await checkPreConditions();

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Task dropped: no version bump requested.`
    );

    expect(result).toBeUndefined();
  });

  it("should return the mask", async () => {
    const mask = [1, 0, 0];
    mocked(getInput).mockReturnValueOnce("a,b,c");
    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");
    mocked(buildMask).mockReturnValueOnce(mask);

    const result = await checkPreConditions();

    expect(info).toHaveBeenCalledTimes(0);

    expect(result).toBe(mask);
  });
});
