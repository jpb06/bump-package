import { TaggedError } from 'effect/Data';

export class InvalidKeywordsError extends TaggedError('invalid-keywords')<{
  cause?: unknown;
  message?: string;
}> {}
