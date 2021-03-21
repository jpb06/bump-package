import { readJson } from "fs-extra";
import { mocked } from "ts-jest/utils";

import mockedPackage from "../../tests-related/data/package.mock.json";
import { readPackage } from "./readPackage";

jest.mock("fs-extra");

describe("Read package function", () => {
  it("should return json (duh)", async () => {
    mocked(readJson).mockImplementationOnce(() => mockedPackage);

    const data = await readPackage();

    expect(data).toStrictEqual(mockedPackage);
  });
});
