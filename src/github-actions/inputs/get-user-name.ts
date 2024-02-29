import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { Effect } from 'effect';

export const getUserName = Effect.withSpan(__filename)(
  Effect.sync(() => {
    const userNameInput = getInput('commit-user');

    return userNameInput.length === 0 ? context.actor : userNameInput;
  }),
);
