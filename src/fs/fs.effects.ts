import { readFile } from 'node:fs/promises';
import { parse } from 'comment-json';
import { Effect, pipe } from 'effect';

import { FsError } from './fs.error.js';

export const readJsonEffect = <T>(path: string) =>
  pipe(
    Effect.tryPromise({
      try: () => readFile(path, { encoding: 'utf8' }),
      catch: (e) => new FsError({ cause: e }),
    }),
    Effect.map((data) => parse(data) as T),
    Effect.withSpan('read-json', { attributes: { path } }),
  );
