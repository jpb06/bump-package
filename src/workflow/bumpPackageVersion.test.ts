import { mocked } from "ts-jest/utils";

import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { pushPackage } from "../logic/git/pushPackage";
import { setupConfig } from "../logic/git/setupConfig";
import { updatePackage } from "../logic/updatePackage";
import { bumpPackageVersion } from "./bumpPackageVersion";

jest.mock("@actions/core");
jest.mock("../logic/checkPreConditions");
jest.mock("../logic/git/pushPackage");
jest.mock("../logic/updatePackage");
jest.mock("../logic/git/setupConfig");

describe("bumpPackageVersion function", () => {
  afterEach(() => jest.resetAllMocks());

  it("should drop the task if pre conditions are not met", async () => {
    mocked(checkPreConditions).mockResolvedValueOnce(undefined);

    await bumpPackageVersion();

    expect(setupConfig).toHaveBeenCalledTimes(0);
    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(pushPackage).toHaveBeenCalledTimes(0);
  });

  it("should complete the task", async () => {
    const version = "1.2.3";
    mocked(checkPreConditions).mockResolvedValueOnce([1, 0, 0]);
    mocked(updatePackage).mockResolvedValueOnce(version);

    await bumpPackageVersion();

    expect(setupConfig).toHaveBeenCalledTimes(1);
    expect(pushPackage).toHaveBeenCalledTimes(1);
    expect(pushPackage).toHaveBeenCalledWith(version);
  });

  it("should report on errors", async () => {
    mocked(checkPreConditions).mockRejectedValueOnce(
      new Error("Big bad error")
    );

    await bumpPackageVersion();

    expect(setupConfig).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `Oh no! An error occured: Big bad error`
    );
  });
});
