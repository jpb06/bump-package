import { FileSystem } from '@effect/platform/FileSystem';
import { Effect, pipe } from 'effect';

export const createEmptyGitFolder = (cwd: string) =>
  pipe(
    Effect.gen(function* () {
      const { makeDirectory, exists } = yield* FileSystem;

      const gitFolderPath = `${cwd}/.git`;

      const gitFolderPathExists = yield* exists(gitFolderPath);
      if (gitFolderPathExists) {
        return;
      }

      yield* makeDirectory(gitFolderPath);
    }),
    Effect.withSpan('create-empty-git-folder'),
  );
