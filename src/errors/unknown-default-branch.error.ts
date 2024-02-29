import { BaseError } from './base.error';

export class UnknownDefaultBranchError extends BaseError {
  readonly _tag = 'UnknownDefaultBranch';
}
