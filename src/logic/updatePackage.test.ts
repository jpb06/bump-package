import { mocked } from "ts-jest/utils";

import { info } from "@actions/core";

import json from "../tests-related/data/package.mock.json";
import { readPackage } from "./fs/readPackage";
import { writePackage } from "./fs/writePackage";
import { updatePackage } from "./updatePackage";

jest.mock("@actions/core");
jest.mock("./fs/readPackage");
jest.mock("./fs/writePackage");

describe("updatePackage function", () => {
  it("should update package.json", async () => {
    mocked(readPackage).mockResolvedValueOnce(json);

    await updatePackage([1, 0, 0]);

    expect(info).toHaveBeenCalledTimes(1);

    expect(writePackage).toHaveBeenCalledTimes(1);
    expect(writePackage).toHaveBeenCalledWith(json, "2.0.0");
  });
});
