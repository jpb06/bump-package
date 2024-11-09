import { Effect, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

import { NoVersionBumpRequestedError } from '../errors/no-version-bump-requested.error';

import { runPromise } from 'effect-errors';
import { getBumpType } from './get-bump-type';

describe('getBumpType function', () => {
  it('should throw if no bump type match', async () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: ['topcool', 'nonono'],
      shouldDefaultToPatch: false,
    };

    const result = await runPromise(
      pipe(getBumpType([messages, keywords]), Effect.flip),
    );

    expect(result).toBeInstanceOf(NoVersionBumpRequestedError);
  });

  it("should return 'major'", async () => {
    const messages = ['oh: topkek', 'bro', 'cool'];
    const keywords = {
      major: ['oh', 'bah'],
      minor: ['baz'],
      patch: ['topcool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = await runPromise(getBumpType([messages, keywords]));

    expect(result).toBe('major');
  });

  it("should return 'minor'", async () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz', 'bro'],
      patch: ['topcool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = await runPromise(getBumpType([messages, keywords]));

    expect(result).toBe('minor');
  });

  it("should return 'patch'", async () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: ['cool', 'nonono'],
      shouldDefaultToPatch: false,
    };
    const result = await runPromise(getBumpType([messages, keywords]));

    expect(result).toBe('patch');
  });

  it("should default to 'patch'", async () => {
    const messages = ['yolo', 'bro', 'cool'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: [],
      shouldDefaultToPatch: true,
    };
    const result = await runPromise(getBumpType([messages, keywords]));

    expect(result).toBe('patch');
  });

  it("should not default to 'patch' if a higher keyword is present", async () => {
    const messages = ['yolo', 'bro', 'cool', 'baz'];
    const keywords = {
      major: ['oh,bah'],
      minor: ['baz'],
      patch: [],
      shouldDefaultToPatch: true,
    };
    const result = await runPromise(getBumpType([messages, keywords]));

    expect(result).toBe('minor');
  });
});
