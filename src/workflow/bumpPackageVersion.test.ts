import { mocked } from "ts-jest/utils";

import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { setConfig } from "../logic/git/setConfig";
import { updatePackage } from "../logic/updatePackage";
import { publish } from "../logic/yarn/publish";
import { bumpPackageVersion } from "./bumpPackageVersion";

jest.mock("@actions/core");
jest.mock("../logic/checkPreConditions");
jest.mock("../logic/git/setConfig");
jest.mock("../logic/updatePackage");
jest.mock("../logic/yarn/publish");

describe("bumpPackageVersion function", () => {
  afterEach(() => jest.resetAllMocks());

  it("should drop the task if pre conditions are not met", async () => {
    mocked(checkPreConditions).mockResolvedValueOnce(undefined);

    await bumpPackageVersion();

    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(publish).toHaveBeenCalledTimes(0);
  });

  it("should perform subtasks", async () => {
    const mask = [1, 0, 0];
    const isPublishRequested = false;
    const publishFolder = "dist";
    mocked(checkPreConditions).mockResolvedValueOnce({
      mask,
      isPublishRequested,
      publishFolder,
    });

    await bumpPackageVersion();

    expect(setConfig).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledWith(mask);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(isPublishRequested, publishFolder);
  });

  it("should report on errors", async () => {
    const errorMessage = "Big bad error";
    mocked(checkPreConditions).mockRejectedValueOnce(new Error(errorMessage));

    await bumpPackageVersion();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `Oh no! An error occured: ${errorMessage}`
    );

    expect(updatePackage).toHaveBeenCalledTimes(0);
  });
});
