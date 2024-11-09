import { TaggedError } from 'effect/Data';

export class CommitMessagesExtractionError extends TaggedError(
  'commit-messages-extraction',
)<{
  cause?: unknown;
  message?: string;
}> {}
