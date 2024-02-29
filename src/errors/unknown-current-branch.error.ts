import { BaseError } from './base.error';

export class UnknownCurrentBranchError extends BaseError {
  readonly _tag = 'UnknownCurrentBranch';
}
