import { Data } from 'effect';

export class InvalidKeywordsError extends Data.TaggedError('InvalidKeywords') {}
