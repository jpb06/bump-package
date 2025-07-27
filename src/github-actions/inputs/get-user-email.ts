import { Effect, pipe } from 'effect';
import { GithubActionsLayer } from 'effect-github-actions-layer';

export const getUserEmail = pipe(
  Effect.all([
    GithubActionsLayer.getContext(),
    GithubActionsLayer.getInput('commit-user-email'),
  ]),
  Effect.map(([context, userEmailInput]) =>
    userEmailInput.length === 0
      ? `${context.actor}@users.noreply.github.com`
      : userEmailInput,
  ),
  Effect.withSpan('get-user-email'),
);
