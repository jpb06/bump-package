import { runPromise } from 'effect-errors';

import { actionWorkflow } from './workflow/action-workflow';

runPromise(actionWorkflow);
