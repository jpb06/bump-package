import { mocked } from "ts-jest/utils";

import { exec } from "@actions/exec";

import json from "../tests-related/data/package.mock.json";
import { readPackage } from "./fs/readPackage";
import { updatePackage } from "./updatePackage";

jest.mock("@actions/core");
jest.mock("@actions/exec");
jest.mock("./fs/readPackage");

describe("updatePackage function", () => {
  it("should update package.json", async () => {
    mocked(readPackage).mockResolvedValueOnce(json);

    await updatePackage([1, 0, 0]);

    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledWith("yarn version", [
      "--new-version",
      "2.0.0",
    ]);
  });
});
