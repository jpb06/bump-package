import { BaseError } from './base.error';

export class NoGithubEventError extends BaseError {
  readonly _tag = 'NoGithubEvent';
}
