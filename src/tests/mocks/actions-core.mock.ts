import type * as ActionsCore from '@actions/core';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

export const mockActionsCore = () => {
  const actionsCoreMock = mockDeep<typeof ActionsCore>();
  vi.doMock('@actions/core', () => actionsCoreMock);

  return actionsCoreMock;
};
