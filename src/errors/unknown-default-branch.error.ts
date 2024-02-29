export class UnknownDefaultBranchError {
  readonly _tag = 'UnknownDefaultBranch';
  readonly message: string | undefined;

  constructor(error?: unknown) {
    if (error instanceof Error) {
      const { message } = error as Error;
      this.message = message;
    } else {
      this.message = error as string;
    }
  }
}
