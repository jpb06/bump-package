import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

export const getUserName = pipe(
  Effect.all([
    GithubActionsLayer.getContext(),
    GithubActionsLayer.getInput('commit-user'),
  ]),
  Effect.map(([context, userNameInput]) =>
    userNameInput.length === 0 ? context.actor : userNameInput,
  ),
  Effect.withSpan('get-user-name'),
);
