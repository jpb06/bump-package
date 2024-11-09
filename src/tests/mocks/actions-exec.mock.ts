import type * as ActionsExec from '@actions/exec';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

export const mockActionsExec = () => {
  const actionsExecMock = mockDeep<typeof ActionsExec>();
  vi.doMock('@actions/exec', () => actionsExecMock);

  return actionsExecMock;
};
