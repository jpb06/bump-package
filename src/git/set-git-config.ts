import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

import { getUserEmail, getUserName } from '../github-actions/inputs/index.js';

export const setGitConfig = pipe(
  Effect.all([getUserEmail, getUserName], { concurrency: 'unbounded' }),
  Effect.flatMap(([userEmail, userName]) =>
    Effect.all(
      [
        GithubActionsLayer.exec('git config', [
          '--global',
          'user.email',
          userEmail,
        ]),
        GithubActionsLayer.exec('git config', [
          '--global',
          'user.name',
          userName,
        ]),
      ],
      { concurrency: 'unbounded' },
    ),
  ),
  Effect.withSpan('set-git-config'),
);
