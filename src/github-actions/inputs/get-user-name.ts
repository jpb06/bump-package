import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { Effect, pipe } from 'effect';

export const getUserName = pipe(
  Effect.sync(() => {
    const userNameInput = getInput('commit-user');

    return userNameInput.length === 0 ? context.actor : userNameInput;
  }),
  Effect.withSpan('get-user-name'),
);
