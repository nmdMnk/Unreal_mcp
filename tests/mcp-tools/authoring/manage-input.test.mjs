#!/usr/bin/env node
/**
 * manage_input Tool Integration Tests
 * Covers all 10 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();
const INPUT_ACTION = '/Game/MCPTest/Testinput_action';
const INPUT_CONTEXT = '/Game/MCPTest/Testinput_mapping_context';

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create test blueprint', toolName: 'manage_blueprint', arguments: { action: 'create', name: `BP_Test_${ts}`, path: TEST_FOLDER, parentClass: 'Actor' }, expected: 'success|already exists' },

  // === CREATE ===
  { scenario: 'CREATE: create_input_action', toolName: 'manage_input', arguments: {"action": "create_input_action", "name": "Testinput_action", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_input_mapping_context', toolName: 'manage_input', arguments: {"action": "create_input_mapping_context", "name": "Testinput_mapping_context", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_mapping', toolName: 'manage_input', arguments: { action: 'add_mapping', contextPath: INPUT_CONTEXT, actionPath: INPUT_ACTION, key: 'SpaceBar' }, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: map_input_action', toolName: 'manage_input', arguments: { action: 'map_input_action', contextPath: INPUT_CONTEXT, actionPath: INPUT_ACTION, key: 'LeftMouseButton' }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_input_trigger', toolName: 'manage_input', arguments: { action: 'set_input_trigger', actionPath: INPUT_ACTION, triggerType: 'Pressed' }, expected: 'success' },
  { scenario: 'CONFIG: set_input_modifier', toolName: 'manage_input', arguments: { action: 'set_input_modifier', contextPath: INPUT_CONTEXT, actionPath: INPUT_ACTION, key: 'SpaceBar', modifierType: 'Negate' }, expected: 'success' },
  // === DELETE ===
  { scenario: 'DELETE: remove_mapping', toolName: 'manage_input', arguments: { action: 'remove_mapping', contextPath: INPUT_CONTEXT, actionPath: INPUT_ACTION, key: 'SpaceBar' }, expected: 'success|not found' },
  // === TOGGLE ===
  { scenario: 'TOGGLE: enable_input_mapping', toolName: 'manage_input', arguments: { action: 'enable_input_mapping', contextPath: INPUT_CONTEXT, priority: 1 }, expected: 'success' },
  { scenario: 'TOGGLE: disable_input_action', toolName: 'manage_input', arguments: { action: 'disable_input_action', actionPath: INPUT_ACTION }, expected: 'success' },
  // === INFO ===
  { scenario: 'INFO: get_input_info', toolName: 'manage_input', arguments: { action: 'get_input_info', assetPath: INPUT_CONTEXT }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test blueprint', toolName: 'manage_asset', arguments: { action: 'delete', path: `${TEST_FOLDER}/BP_Test_${ts}`, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'DELETE_FAILED|success|not found' },
];

runToolTests('manage-input', testCases);
