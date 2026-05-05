#!/usr/bin/env node
/**
 * manage_behavior_tree Tool Integration Tests
 * Covers all 6 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/GameplayAssets';
const ts = Date.now();
const behaviorTreeName = `BT_Test_${ts}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },

  // === ACTION ===
  {
    scenario: 'ACTION: create',
    toolName: 'manage_behavior_tree',
    arguments: { action: 'create', name: behaviorTreeName, savePath: TEST_FOLDER },
    expected: 'success',
    captureResult: { key: 'behaviorTreePath', fromField: 'assetPath' }
  },
  // === ADD ===
  {
    scenario: 'ADD: add sequence node',
    toolName: 'manage_behavior_tree',
    arguments: { action: 'add_node', assetPath: '${captured:behaviorTreePath}', nodeType: 'Sequence', x: 0, y: 0 },
    expected: 'success',
    captureResult: { key: 'sequenceNodeId', fromField: 'nodeId' }
  },
  {
    scenario: 'ADD: add wait task node',
    toolName: 'manage_behavior_tree',
    arguments: { action: 'add_node', assetPath: '${captured:behaviorTreePath}', nodeType: 'Wait', x: 300, y: 120 },
    expected: 'success',
    captureResult: { key: 'waitNodeId', fromField: 'nodeId' }
  },
  // === CONNECT ===
  {
    scenario: 'CONNECT: connect_nodes',
    toolName: 'manage_behavior_tree',
    arguments: {
      action: 'connect_nodes',
      assetPath: '${captured:behaviorTreePath}',
      parentNodeId: '${captured:sequenceNodeId}',
      childNodeId: '${captured:waitNodeId}'
    },
    expected: 'success'
  },
  // === CONFIG ===
  {
    scenario: 'CONFIG: set_node_properties',
    toolName: 'manage_behavior_tree',
    arguments: {
      action: 'set_node_properties',
      assetPath: '${captured:behaviorTreePath}',
      nodeId: '${captured:waitNodeId}',
      comment: 'MCP behavior tree live test node'
    },
    expected: 'success'
  },
  // === ACTION ===
  {
    scenario: 'ACTION: break_connections',
    toolName: 'manage_behavior_tree',
    arguments: { action: 'break_connections', assetPath: '${captured:behaviorTreePath}', nodeId: '${captured:sequenceNodeId}' },
    expected: 'success'
  },
  // === DELETE ===
  {
    scenario: 'DELETE: remove_node',
    toolName: 'manage_behavior_tree',
    arguments: { action: 'remove_node', assetPath: '${captured:behaviorTreePath}', nodeId: '${captured:waitNodeId}' },
    expected: 'success'
  },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete behavior tree', toolName: 'manage_asset', arguments: { action: 'delete', path: `${TEST_FOLDER}/${behaviorTreeName}`, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-behavior-tree', testCases);
