import { exec } from "@actions/exec";

import { publish } from "./publish";

jest.mock("@actions/exec");

describe("publish function", () => {
  it("should not publish the folder", async () => {
    await publish(false, ".");

    expect(exec).toHaveBeenCalledTimes(0);
  });

  it("should publish the folder", async () => {
    const folder = "dist";
    await publish(true, folder);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, `yarn build`);
    expect(exec).toHaveBeenNthCalledWith(2, `yarn publish ./${folder}`);
  });
});
