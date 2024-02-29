import { BaseError } from './base.error';

export class CommitMessagesExtractionError extends BaseError {
  readonly _tag = 'CommitMessagesExtraction';
}
