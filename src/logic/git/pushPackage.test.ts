import { info } from "@actions/core";

import { mockSimpleGit } from "../../tests-related/mocks/simpleGit.mock";
import { pushNewVersion } from "./pushPackage";

jest.mock("simple-git");
jest.mock("@actions/github");
jest.mock("@actions/core");

describe("gitPushPackage function", () => {
  const mocks = mockSimpleGit();

  it("should push the package and a tag", async () => {
    const version = "1.0.0";
    await pushNewVersion(version);

    expect(mocks.addConfig).toHaveBeenCalledTimes(2);

    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(mocks.commit).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledTimes(1);

    expect(mocks.addTag).toHaveBeenCalledTimes(1);
    expect(mocks.pushTags).toHaveBeenCalledTimes(1);

    expect(info).toHaveBeenCalledTimes(2);
  });
});
