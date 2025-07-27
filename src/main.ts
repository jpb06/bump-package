import { NodeFileSystem } from '@effect/platform-node';
import { Effect, Layer, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { GithubActionsLayerLive } from 'effect-github-actions-layer';

import { actionWorkflow } from './workflow/action-workflow.js';
import { collectErrorDetails } from './workflow/errors-reporting/index.js';

const program = pipe(
  actionWorkflow,
  Effect.sandbox,
  Effect.catchAll(collectErrorDetails),
  Effect.provide(Layer.mergeAll(NodeFileSystem.layer, GithubActionsLayerLive)),
);

runPromise(program);
