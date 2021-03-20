import { mocked } from "ts-jest/utils";

import { info, setFailed, warning } from "@actions/core";

import { extractInputs } from "../logic/extractInputs";
import { getHeadCommitMessage } from "../logic/getHeadCommitMessage";
import { readPackage } from "../logic/readPackage";
import { writePackage } from "../logic/writePackage";
import { bumpPackageVersion } from "./bumpPackageVersion";

jest.mock("../logic/extractInputs");
jest.mock("@actions/core");
jest.mock("../logic/getHeadCommitMessage");
jest.mock("../logic/readPackage");
jest.mock("../logic/writePackage");
jest.mock("../logic/gitPushPackage");

describe("bumpPackageVersion function", () => {
  afterEach(() => jest.resetAllMocks());

  it("should drop the task and print a warning if the commit message ", async () => {
    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("");

    await bumpPackageVersion();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      "> Task dropped: no HEAD commit message found."
    );
  });

  it("should drop the task and print a warning if keywords were not provided", async () => {
    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");

    await bumpPackageVersion();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task dropped: expecting 3 keywords but got 1. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );
  });

  it("should drop the task and print a warning if not enough keywords were provided", async () => {
    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "one,two",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");

    await bumpPackageVersion();

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `> Task dropped: expecting 3 keywords but got 2. Keywords should be separated by a comma. Example : "Major,Minor,Patch".`
    );
  });

  it("should drop the task if no bump was requested", async () => {
    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "[major],[minor],[patch]",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("yolo");

    await bumpPackageVersion();

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Task dropped: no version bump requested.`
    );
  });

  it("should bump version (ùmajor)", async () => {
    const data = {
      version: "25.3.19",
    };
    const newVersion = "26.0.0";

    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "[major],[minor],[patch]",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("[major]: yolo");
    mocked(readPackage).mockResolvedValueOnce(data);

    await bumpPackageVersion();

    expect(writePackage).toHaveBeenCalledTimes(1);
    expect(writePackage).toHaveBeenCalledWith(data, newVersion);

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Version has been bumped to ${newVersion}`
    );
  });

  it("should bump version (minor)", async () => {
    const data = {
      version: "1.3.19",
    };
    const newVersion = "1.4.0";

    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "[major],[minor],[patch]",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("[minor]: yolo");
    mocked(readPackage).mockResolvedValueOnce(data);

    await bumpPackageVersion();

    expect(writePackage).toHaveBeenCalledTimes(1);
    expect(writePackage).toHaveBeenCalledWith(data, newVersion);

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Version has been bumped to ${newVersion}`
    );
  });

  it("should bump version (patch)", async () => {
    const data = {
      version: "1.3.19",
    };
    const newVersion = "1.3.20";

    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "[major],[minor],[patch]",
    });
    mocked(getHeadCommitMessage).mockResolvedValueOnce("[patch]: yolo");
    mocked(readPackage).mockResolvedValueOnce(data);

    await bumpPackageVersion();

    expect(writePackage).toHaveBeenCalledTimes(1);
    expect(writePackage).toHaveBeenCalledWith(data, newVersion);

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      `> Version has been bumped to ${newVersion}`
    );
  });

  it("should report the task as failed if an error was raised", async () => {
    const error = { message: "Oh no!" };

    mocked(extractInputs).mockReturnValueOnce({
      branch: "",
      rawKeywords: "[major],[minor],[patch]",
    });
    mocked(getHeadCommitMessage).mockRejectedValueOnce(error);

    await bumpPackageVersion();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenLastCalledWith(error.message);
  });
});
