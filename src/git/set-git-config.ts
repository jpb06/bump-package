import { Effect, pipe } from 'effect';

import {
  setGitUserEmail,
  setGitUserName,
} from '../github-actions/exec/index.js';
import { getUserEmail, getUserName } from '../github-actions/inputs/index.js';

export const setGitConfig = pipe(
  Effect.all([getUserEmail, getUserName], {
    concurrency: 'unbounded',
  }),
  Effect.flatMap(([userEmail, userName]) =>
    Effect.all([setGitUserEmail(userEmail), setGitUserName(userName)], {
      concurrency: 'unbounded',
    }),
  ),
  Effect.withSpan('set-git-config'),
);
