import { buildMask } from "./buildMask";

describe("buildMask function", () => {
  const keywords = ["major", "minor", "patch"];

  it("should return an array filled with zeros", () => {
    const result = buildMask("yolo", keywords);

    expect(result).toStrictEqual([0, 0, 0]);
  });

  it("should return an array starting with one", () => {
    const result = buildMask("majoryolo", keywords);

    expect(result).toStrictEqual([1, 0, 0]);
  });

  it("should return an array having one at index 1", () => {
    const result = buildMask("minoryolo", keywords);

    expect(result).toStrictEqual([0, 1, 0]);
  });

  it("should return an array having one at index 2", () => {
    const result = buildMask("patchyolo", keywords);

    expect(result).toStrictEqual([0, 0, 1]);
  });

  it("should return an array filled with ones", () => {
    const result = buildMask("majoryominorlopatch", keywords);

    expect(result).toStrictEqual([1, 0, 0]);
  });
});
