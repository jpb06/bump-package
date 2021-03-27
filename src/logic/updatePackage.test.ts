import { mocked } from "ts-jest/utils";

import { exec } from "@actions/exec";
import { context } from "@actions/github";

import json from "../tests-related/data/package.mock.json";
import { readPackage } from "./fs/readPackage";
import { updatePackage } from "./updatePackage";

jest.mock("@actions/core");
jest.mock("@actions/exec");
jest.mock("@actions/github");
jest.mock("./fs/readPackage");

describe("updatePackage function", () => {
  it("should update package.json", async () => {
    mocked(readPackage).mockResolvedValueOnce(json);

    await updatePackage([1, 0, 0]);

    expect(exec).toHaveBeenCalledTimes(3);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      `git config --global user.name ${context.actor}`
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      `git config --global user.email ${context.actor}@users.noreply.github.com`
    );
    expect(exec).toHaveBeenNthCalledWith(3, "yarn version", [
      "--new-version",
      "2.0.0",
    ]);
  });
});
