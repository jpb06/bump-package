import { Data } from 'effect';

export class CommitMessagesExtractionError extends Data.TaggedError(
  'CommitMessagesExtraction',
) {}
