import { exec } from "@actions/exec";
import { context } from "@actions/github";

import { setConfig } from "./setConfig";

jest.mock("@actions/exec");
jest.mock("@actions/github");

describe("setConfig function", () => {
  it("should set git config", async () => {
    await setConfig();

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, "git config", [
      "--global",
      "user.name",
      context.actor,
    ]);
    expect(exec).toHaveBeenNthCalledWith(2, "git config", [
      "--global",
      "user.email",
      `${context.actor}@users.noreply.github.com`,
    ]);
  });
});
