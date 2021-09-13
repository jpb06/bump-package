import { getBumpType } from './getBumpType';

describe('getBumpType function', () => {
  it("should return 'none'", () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: ['topcool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = getBumpType(messages, keywords);

    expect(result).toBe('none');
  });

  it("should return 'major'", () => {
    const messages = ['oh: topkek', 'bro', 'cool'];
    const keywords = {
      major: ['oh', 'bah'],
      minor: ['baz'],
      patch: ['topcool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = getBumpType(messages, keywords);

    expect(result).toBe('major');
  });

  it("should return 'minor'", () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz', 'bro'],
      patch: ['topcool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = getBumpType(messages, keywords);

    expect(result).toBe('minor');
  });

  it("should return 'patch'", () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: ['cool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = getBumpType(messages, keywords);

    expect(result).toBe('patch');
  });

  it("should default to 'patch'", () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: [],
      shouldDefaultToPatch: true,
    };
    const result = getBumpType(messages, keywords);

    expect(result).toBe('patch');
  });

  it("should not default to 'patch' if a higher keyword is present", () => {
    const messages = ['yolo', 'bro', 'cool', 'baz'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: [],
      shouldDefaultToPatch: true,
    };
    const result = getBumpType(messages, keywords);

    expect(result).toBe('minor');
  });
});
