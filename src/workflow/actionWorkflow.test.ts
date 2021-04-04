import { mocked } from "ts-jest/utils";

import { setFailed } from "@actions/core";

import { checkPreConditions } from "../logic/checkPreConditions";
import { setConfig } from "../logic/git/setConfig";
import { updatePackage } from "../logic/updatePackage";
import { publish } from "../logic/yarn/publish";
import { actionWorkflow } from "./actionWorkflow";

jest.mock("@actions/core");
jest.mock("../logic/checkPreConditions");
jest.mock("../logic/git/setConfig");
jest.mock("../logic/updatePackage");
jest.mock("../logic/yarn/publish");

describe("actionWorkflow function", () => {
  afterEach(() => jest.resetAllMocks());

  it("should fail the task if pre conditions are invalid", async () => {
    mocked(checkPreConditions).mockResolvedValueOnce({
      isActionNeeded: false,
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
      error: "Oh no!",
    });

    await actionWorkflow();

    expect(updatePackage).toHaveBeenCalledTimes(0);
    expect(publish).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
  });

  it("should drop the task if pre conditions are not met", async () => {
    mocked(checkPreConditions).mockResolvedValueOnce({
      isActionNeeded: false,
      mask: [],
      isPublishRequested: false,
      publishFolder: ".",
    });

    await actionWorkflow();

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
      isActionNeeded: true,
    });

    await actionWorkflow();

    expect(setConfig).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledTimes(1);
    expect(updatePackage).toHaveBeenCalledWith(mask);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(isPublishRequested, publishFolder);
  });

  it("should report on errors", async () => {
    const errorMessage = "Big bad error";
    mocked(checkPreConditions).mockRejectedValueOnce(new Error(errorMessage));

    await actionWorkflow();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `Oh no! An error occured: ${errorMessage}`
    );

    expect(updatePackage).toHaveBeenCalledTimes(0);
  });
});
