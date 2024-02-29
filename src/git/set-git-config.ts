import { Effect, pipe } from 'effect';

import { setGitUserEmail } from '../github-actions/exec/set-git-user-email';
import { setGitUserName } from '../github-actions/exec/set-git-user-name';
import { getUserEmail } from '../github-actions/inputs/get-user-email';
import { getUserName } from '../github-actions/inputs/get-user-name';

export const setGitConfig = Effect.withSpan(__filename)(
  pipe(
    Effect.all([getUserEmail, getUserName], {
      concurrency: 'unbounded',
    }),
    Effect.flatMap(([userEmail, userName]) =>
      Effect.all([setGitUserEmail(userEmail), setGitUserName(userName)], {
        concurrency: 'unbounded',
      }),
    ),
  ),
);
