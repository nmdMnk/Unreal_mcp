import { describe, expect, it, vi } from 'vitest';
import { handleLevelTools } from './level-handlers.js';
import type { ITools } from '../../types/tool-interfaces.js';

function createTools() {
  const sendAutomationRequest = vi.fn(async () => ({ success: true }));
  const tools = {
    automationBridge: {
      isConnected: () => true,
      sendAutomationRequest
    }
  } as unknown as ITools;

  return { tools, sendAutomationRequest };
}

describe('handleLevelTools path normalization', () => {
  it('normalizes snake_case Content paths before dispatch', async () => {
    const { tools, sendAutomationRequest } = createTools();

    await handleLevelTools('save_as', { action: 'save_as', save_path: 'Content\\Maps\\Demo' }, tools);

    expect(sendAutomationRequest).toHaveBeenCalledWith('manage_level', {
      action: 'save_level_as',
      savePath: '/Game/Maps/Demo'
    }, {});
  });

  it('validates normalized /Content level paths before dispatch', async () => {
    const { tools, sendAutomationRequest } = createTools();

    await handleLevelTools('load', { action: 'load', levelPath: '/Content/Maps/Demo' }, tools);

    expect(sendAutomationRequest).toHaveBeenCalledWith('manage_level', {
      action: 'load',
      levelPath: '/Game/Maps/Demo',
      streaming: false
    }, {});
  });

  it('normalizes load_cells levelPath after preserving extra arguments', async () => {
    const { tools, sendAutomationRequest } = createTools();

    await handleLevelTools('load_cells', {
      action: 'load_cells',
      levelPath: String.raw`Content\Maps\Demo`,
      cells: ['Cell_0'],
      customFlag: true
    }, tools);

    expect(sendAutomationRequest).toHaveBeenCalledWith('manage_world_partition', {
      action: 'load_cells',
      levelPath: '/Game/Maps/Demo',
      cells: ['Cell_0'],
      customFlag: true,
      subAction: 'load_cells',
      origin: undefined,
      extent: undefined
    }, {});
  });
});
