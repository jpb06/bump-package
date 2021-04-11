import { mocked } from "ts-jest/utils";

import { info, setFailed } from "@actions/core";

import { setGitConfig } from "../logic/git/setGitConfig";
import { getGithubEventData, GithubEventData } from "../logic/inputs/getGithubEventData";
import { getKeywords, Keywords } from "../logic/inputs/getKeywords";
import { getBumpType } from "../logic/semver/getBumpType";
import { updatePackage } from "../logic/updatePackage";
import { actionWorkflow } from "./actionWorkflow";

jest.mock("@actions/core");
jest.mock("../logic/git/setGitConfig");
jest.mock("../logic/updatePackage");
jest.mock("../logic/inputs/getKeywords");
jest.mock("../logic/inputs/getGithubEventData");
jest.mock("../logic/semver/getBumpType");

describe("actionWorkflow function", () => {
  afterEach(() => jest.resetAllMocks());

  it("should fail the task if some keywords are missing", async () => {
    mocked(getKeywords).mockReturnValueOnce({ hasErrors: true } as Keywords);

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
  });

  it("should fail the task if github event data is missing", async () => {
    mocked(getKeywords).mockReturnValueOnce({ hasErrors: false } as Keywords);
    mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: true,
    } as GithubEventData);

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
  });

  it("should drop the task if the action is not run on master branch", async () => {
    mocked(getKeywords).mockReturnValueOnce({ hasErrors: false } as Keywords);
    mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isMasterBranch: false,
      messages: [],
    });

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it("should drop the task if no bump has been requested", async () => {
    mocked(getKeywords).mockReturnValueOnce({ hasErrors: false } as Keywords);
    mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isMasterBranch: true,
      messages: [],
    });
    mocked(getBumpType).mockReturnValueOnce("none");

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      "> Task cancelled: no version bump requested."
    );
  });

  it("should bump the package", async () => {
    const bumpType = "major";
    mocked(getKeywords).mockReturnValueOnce({ hasErrors: false } as Keywords);
    mocked(getGithubEventData).mockResolvedValueOnce({
      hasErrors: false,
      isMasterBranch: true,
      messages: [],
    });
    mocked(getBumpType).mockReturnValueOnce(bumpType);

    await actionWorkflow();

    expect(setGitConfig).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledWith(bumpType);
    expect(setFailed).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(0);
  });

  it("should report on errors", async () => {
    const errorMessage = "Big bad error";
    mocked(getKeywords).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await actionWorkflow();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `Oh no! An error occured: ${errorMessage}`
    );

    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
  });
});
