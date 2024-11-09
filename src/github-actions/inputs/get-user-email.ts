import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { Effect, pipe } from 'effect';

export const getUserEmail = pipe(
  Effect.sync(() => {
    const userEmailInput = getInput('commit-user-email');

    return userEmailInput.length === 0
      ? `${context.actor}@users.noreply.github.com`
      : userEmailInput;
  }),
  Effect.withSpan('get-user-email'),
);
