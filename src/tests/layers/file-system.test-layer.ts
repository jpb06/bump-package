import { FileSystem } from '@effect/platform/FileSystem';
import { Effect, Layer } from 'effect';
import { TaggedError } from 'effect/Data';
import { type Mock, vi } from 'vitest';

export class FileSystemTestLayerError extends TaggedError(
  'file-system-test-layer-error',
)<{
  cause?: unknown;
  message?: string;
}> {}

const init = <T>(
  input: Effect.Effect<T> | Mock | undefined,
  name: keyof FileSystem,
) => {
  if (input === undefined) {
    return vi.fn().mockReturnValue(
      Effect.fail(
        new FileSystemTestLayerError({
          cause: `No implementation provided for ${name}`,
        }),
      ),
    );
  }

  if (Effect.isEffect(input)) {
    return vi.fn().mockReturnValue(input);
  }

  return input;
};

type FsTestLayerInput = {
  exists?: Effect.Effect<boolean> | Mock;
  makeDirectory?: Effect.Effect<void> | Mock;
  readFileString?: Effect.Effect<string> | Mock;
};

export const makeFsTestLayer = (input: FsTestLayerInput) => {
  const existsMock = init(input.exists, 'exists');
  const makeDirectoryMock = init(input.makeDirectory, 'makeDirectory');
  const readFileStringMock = init(input.readFileString, 'readFileString');

  const make: Partial<FileSystem> = {
    exists: existsMock,
    makeDirectory: makeDirectoryMock,
    readFileString: readFileStringMock,
  };

  return {
    FsTestLayer: Layer.succeed(FileSystem, FileSystem.of(make as never)),
    existsMock,
    makeDirectoryMock,
    readFileStringMock,
  };
};
