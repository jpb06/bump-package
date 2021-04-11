import { error } from "@actions/core";

import { mockGetInputKeywords } from "../../tests-related/mocks/getInput.keywords.mock";
import { getKeywords } from "./getKeywords";

jest.mock("@actions/core");

describe("getKeywords function", () => {
  beforeEach(() => jest.resetAllMocks());

  it("should send an error message three times", () => {
    mockGetInputKeywords("", "", "");

    const result = getKeywords();

    expect(error).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenNthCalledWith(
      1,
      `> Error: Expecting at least one major keyword but got 0.`
    );
    expect(error).toHaveBeenNthCalledWith(
      2,
      `> Error: Expecting at least one minor keyword but got 0.`
    );
    expect(error).toHaveBeenNthCalledWith(
      3,
      `> Error: Expecting at least one patch keyword but got 0.`
    );

    expect(result.major).toStrictEqual([""]);
    expect(result.minor).toStrictEqual([""]);
    expect(result.patch).toStrictEqual([""]);
    expect(result.hasErrors).toBe(true);
  });

  it("should return inputs", () => {
    mockGetInputKeywords("yolo,bro", "cool,man,fun", "super");

    const result = getKeywords();

    expect(error).toHaveBeenCalledTimes(0);
    expect(result.major).toStrictEqual(["yolo", "bro"]);
    expect(result.minor).toStrictEqual(["cool", "man", "fun"]);
    expect(result.patch).toStrictEqual(["super"]);
    expect(result.hasErrors).toBe(false);
  });
});
