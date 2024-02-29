import { BaseError } from './base.error';

export class NoVersionBumpRequestedError extends BaseError {
  readonly _tag = 'NoVersionBumpRequested';
}
