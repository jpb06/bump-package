import { getNewVersion } from "./getNewVersion";

describe("getNewVersion function", () => {
  it("should bump major", () => {
    const mask = [1, 0, 0];
    const version = "10.20.5";

    const newVersion = getNewVersion(mask, version);

    expect(newVersion).toBe("11.0.0");
  });

  it("should bump minor", () => {
    const mask = [0, 1, 0];
    const version = "10.20.5";

    const newVersion = getNewVersion(mask, version);

    expect(newVersion).toBe("10.21.0");
  });

  it("should bump patch", () => {
    const mask = [0, 0, 1];
    const version = "10.20.5";

    const newVersion = getNewVersion(mask, version);

    expect(newVersion).toBe("10.20.6");
  });

  it("should bump minor & patch", () => {
    const mask = [0, 1, 1];
    const version = "10.20.5";

    const newVersion = getNewVersion(mask, version);

    expect(newVersion).toBe("10.21.1");
  });

  it("should bump major, minor & patch", () => {
    const mask = [1, 1, 1];
    const version = "10.20.5";

    const newVersion = getNewVersion(mask, version);

    expect(newVersion).toBe("11.1.1");
  });
});
