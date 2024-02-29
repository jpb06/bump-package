import { Effect, pipe } from 'effect';

export const runPromise = <A, E>(effect: Effect.Effect<A, E>): Promise<A> =>
  Effect.runPromise(pipe(effect, Effect.sandbox));
