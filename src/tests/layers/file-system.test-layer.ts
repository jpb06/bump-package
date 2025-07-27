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
  readFileString?: Effect.Effect<string> | Mock;
};

export const makeFsTestLayer = (input: FsTestLayerInput) => {
  const readFileStringMock = init(input.readFileString, 'readFileString');

  const make: Partial<FileSystem> = {
    readFileString: readFileStringMock,
  };

  return {
    FsTestLayer: Layer.succeed(FileSystem, FileSystem.of(make as never)),
    readFileStringMock,
  };
};
