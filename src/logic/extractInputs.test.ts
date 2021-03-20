import { mockInputs } from "../tests-related/mocks/input.mock";
import { extractInputs } from "./extractInputs";

jest.mock("@actions/core");

describe("extractInputs function", () => {
  it("should return inputs", () => {
    const branch = "yolo";
    const keywords = "a,b,c";
    mockInputs(branch, keywords);

    const result = extractInputs();

    expect(result).toStrictEqual({
      branch,
      rawKeywords: keywords,
    });
  });
});
