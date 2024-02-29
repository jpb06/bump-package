import { BaseError } from './base.error';

export class InvalidKeywordsError extends BaseError {
  readonly _tag = 'InvalidKeywords';
}
