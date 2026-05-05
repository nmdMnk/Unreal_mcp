#!/usr/bin/env node
/**
 * manage_pipeline Tool Integration Tests
 * Covers all 3 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/ManagePipeline';

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },

  // === ACTION ===
  {
    scenario: 'ACTION: run_ubt',
    toolName: 'manage_pipeline',
    arguments: {
      action: 'run_ubt',
      target: 'MCPtestEditor',
      platform: 'Linux',
      configuration: 'Development'
    },
    expected: 'success'
  },
  // === INFO ===
  { scenario: 'INFO: list_categories', toolName: 'manage_pipeline', arguments: {"action": "list_categories"}, expected: 'success' },
  { scenario: 'INFO: get_status', toolName: 'manage_pipeline', arguments: {"action": "get_status"}, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-pipeline', testCases);
