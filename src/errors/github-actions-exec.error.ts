import { BaseError } from './base.error';

export class GithubActionsExecError extends BaseError {
  readonly _tag = 'GithubActionsExec';
}
