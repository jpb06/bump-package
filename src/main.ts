import { NodeFileSystem } from '@effect/platform-node';
import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';

import { actionWorkflow } from './workflow/action-workflow.js';
import { collectErrorDetails } from './workflow/errors-reporting/index.js';

const program = pipe(
  actionWorkflow,
  Effect.sandbox,
  Effect.catchAll(collectErrorDetails),
  Effect.provide(NodeFileSystem.layer),
);

runPromise(program);
