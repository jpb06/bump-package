import { getBranchName } from "./getBranchName";

describe("getBranchName function", () => {
  it("should return undefined if ref is empty", () => {
    process.env.GITHUB_REF = "";

    const result = getBranchName();

    expect(result).toBeUndefined();
  });

  it("should return undefined if ref if invalid", () => {
    process.env.GITHUB_REF = "yolo";

    const result = getBranchName();

    expect(result).toBeUndefined();
  });

  it("should return the branch name", () => {
    process.env.GITHUB_REF = "refs/heads/yolo";

    const result = getBranchName();

    expect(result).toBe("yolo");
  });
});
