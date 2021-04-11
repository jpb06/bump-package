import { exec } from "@actions/exec";

import { updatePackage } from "./updatePackage";

jest.mock("@actions/exec");

describe("updatePackage function", () => {
  it("should update package.json", async () => {
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
