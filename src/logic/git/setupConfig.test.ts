import { mockSimpleGit } from "../../tests-related/mocks/simpleGit.mock";
import { setupConfig } from "./setupConfig";

jest.mock("simple-git");

describe("setupConfig function", () => {
  const mocks = mockSimpleGit();

  it("should setup git config", async () => {
    await setupConfig();

    expect(mocks.addConfig).toHaveBeenCalledTimes(2);
  });
});
