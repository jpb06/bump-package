import { Effect, Layer } from 'effect';
import { TaggedError } from 'effect/Data';
import {
  GithubActions,
  type GithubActionsInterface,
  type GithubContext,
} from 'effect-github-actions-layer';
import { type Mock, vi } from 'vitest';

export class GithubActionsTestLayerError extends TaggedError(
  'github-actions-test-layer-error',
)<{
  cause?: unknown;
  message?: string;
}> {}

const init = <T>(
  input: Effect.Effect<T> | Mock | undefined,
  name: keyof GithubActionsInterface,
) => {
  if (input === undefined) {
    return vi.fn().mockReturnValue(
      Effect.fail(
        new GithubActionsTestLayerError({
          cause: `No implementation provided for ${name}`,
        }),
      ),
    );
  }

  if (Effect.isEffect(input)) {
    return vi.fn().mockReturnValue(input);
  }

  return input;
};

type GithubActionsTestLayerInput = {
  error?: Effect.Effect<void> | Mock;
  exec?: Effect.Effect<void> | Mock;
  getContext?: Effect.Effect<Partial<GithubContext>> | Mock;
  getInput?: Effect.Effect<string> | Mock;
  info?: Effect.Effect<void> | Mock;
  setFailed?: Effect.Effect<void> | Mock;
  setOutput?: Effect.Effect<void> | Mock;
};

export const makeGithubActionsTestLayer = (
  input: GithubActionsTestLayerInput,
) => {
  const errorMock = init(input.error, 'error');
  const execMock = init(input.exec, 'exec');
  const getContextMock = init(input.getContext, 'getContext');
  const getInputMock = init(input.getInput, 'getInput');
  const infoMock = init(input.info, 'info');
  const setFailedMock = init(input.setFailed, 'setFailed');
  const setOutputMock = init(input.setOutput, 'setOutput');

  const make: Partial<GithubActionsInterface> = {
    debug: vi.fn().mockReturnValue(
      Effect.fail(
        new GithubActionsTestLayerError({
          cause: 'No implementation provided for debug',
        }),
      ),
    ),
    warning: vi.fn().mockReturnValue(
      Effect.fail(
        new GithubActionsTestLayerError({
          cause: 'No implementation provided for warning',
        }),
      ),
    ),
    isDebug: vi.fn().mockReturnValue(
      Effect.fail(
        new GithubActionsTestLayerError({
          cause: 'No implementation provided for isDebug',
        }),
      ),
    ),
    error: errorMock,
    exec: execMock,
    getContext: getContextMock,
    getInput: getInputMock,
    info: infoMock,
    setFailed: setFailedMock,
    setOutput: setOutputMock,
  };

  return {
    GithubActionsTestLayer: Layer.succeed(
      GithubActions,
      GithubActions.of(make as never),
    ),
    errorMock,
    execMock,
    getContextMock,
    getInputMock,
    infoMock,
    setFailedMock,
    setOutputMock,
  };
};
