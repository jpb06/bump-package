import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { Effect } from 'effect';

export const getUserEmail = Effect.withSpan(__filename)(
  Effect.sync(() => {
    const userEmailInput = getInput('commit-user-email');

    return userEmailInput.length === 0
      ? `${context.actor}@users.noreply.github.com`
      : userEmailInput;
  }),
);
