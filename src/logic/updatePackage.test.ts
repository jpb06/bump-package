import { mocked } from "ts-jest/utils";

import { getInput } from "@actions/core";
import { exec } from "@actions/exec";

import { updatePackage } from "./updatePackage";

jest.mock("@actions/core");
jest.mock("@actions/exec");

describe("updatePackage function", () => {
  beforeEach(() => jest.resetAllMocks());

  it("should update package.json", async () => {
    mocked(getInput).mockReturnValueOnce("false");

    const bumpType = "major";

    await updatePackage(bumpType);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, "npm version", [
      bumpType,
      "--no-git-tag-version",
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, "git push");
  });

  it("should update package.json and create a tag", async () => {
    mocked(getInput).mockReturnValueOnce("true");

    const bumpType = "major";

    await updatePackage(bumpType);

    expect(exec).toHaveBeenCalledTimes(3);
    expect(exec).toHaveBeenNthCalledWith(1, "npm version", [
      bumpType,
      "--force",
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, "git push");
    expect(exec).toHaveBeenNthCalledWith(3, "git push", ["--tags"]);
  });
});
