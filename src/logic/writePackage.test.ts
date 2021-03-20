import { writeJson } from "fs-extra";

import mockedPackage from "../tests-related/data/package.mock.json";
import { writePackage } from "./writePackage";

jest.mock("fs-extra");

describe("Write package function", () => {
  it("should change package version", async () => {
    const newVersion = "50.50.50";
    await writePackage(mockedPackage, newVersion);

    expect(writeJson).toHaveBeenCalledWith("./package.json", {
      ...mockedPackage,
      version: newVersion,
    });
  });
});
