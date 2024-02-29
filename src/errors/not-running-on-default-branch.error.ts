import { BaseError } from './base.error';

export class NotRunningOnDefaultBranchError extends BaseError {
  readonly _tag = 'NotRunningOnDefaultBranch';
}
