#!/usr/bin/env node
/**
 * manage_blueprint Tool Integration Tests
 * Covers all 36 actions with proper setup/teardown sequencing.
 *
 * Every action that operates on a blueprint must include a valid
 * blueprintPath pointing to the blueprint created during setup.
 *
 * captureResult is used to capture real nodeIds from node creation
 * so that subsequent node operations (delete, connect, etc.) use
 * real GUIDs that exist in the blueprint graph.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();
const BP_NAME = `BP_Test_${ts}`;
const BP_PATH = `${TEST_FOLDER}/${BP_NAME}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create test blueprint', toolName: 'manage_blueprint', arguments: { action: 'create_blueprint', name: BP_NAME, path: TEST_FOLDER, parentClass: 'Actor' }, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.assetPath', equals: BP_PATH, label: 'create_blueprint path alias uses requested folder' }] },

  // === ACTION: create (requires name + path/blueprintPath) ===
  { scenario: 'ACTION: create', toolName: 'manage_blueprint', arguments: { action: 'create', name: `BP_Create_${ts}`, path: TEST_FOLDER, parentClass: 'Actor' }, expected: 'success|already exists' },

  // === INFO: get_blueprint (uses blueprintPath) ===
  { scenario: 'INFO: get_blueprint', toolName: 'manage_blueprint', arguments: { action: 'get_blueprint', blueprintPath: BP_PATH }, expected: 'success' },

  // === ACTION: get (uses blueprintPath via name fallback) ===
  { scenario: 'ACTION: get', toolName: 'manage_blueprint', arguments: { action: 'get', blueprintPath: BP_PATH }, expected: 'success' },

  // === ACTION: compile (uses blueprintPath) ===
  { scenario: 'ACTION: compile', toolName: 'manage_blueprint', arguments: { action: 'compile', blueprintPath: BP_PATH }, expected: 'success' },

  // === ADD: add_component (blueprintPath + componentClass + componentName) ===
  { scenario: 'ADD: add_component', toolName: 'manage_blueprint', arguments: { action: 'add_component', blueprintPath: BP_PATH, componentClass: 'PointLightComponent', componentName: 'TestLight' }, expected: 'success|already exists' },

// === CONFIG: set_default (blueprintPath + propertyName + value/propertyValue) ===
// bGenerateOverlapEvents is on UPrimitiveComponent; this Actor BP root is SceneComponent.
// Use a property that exists on AActor CDO directly.
{ scenario: 'CONFIG: set_default', toolName: 'manage_blueprint', arguments: { action: 'set_default', blueprintPath: BP_PATH, propertyName: 'bReplicates', propertyValue: true }, expected: 'success' },

  // === CONFIG: modify_scs (blueprintPath + operations) ===
  { scenario: 'CONFIG: modify_scs', toolName: 'manage_blueprint', arguments: { action: 'modify_scs', blueprintPath: BP_PATH, operations: [{ type: 'add_component', componentName: 'TestModSCSComp', componentClass: 'SceneComponent' }] }, expected: 'success|already exists' },

  // === INFO: get_scs (blueprintPath) ===
  { scenario: 'INFO: get_scs', toolName: 'manage_blueprint', arguments: { action: 'get_scs', blueprintPath: BP_PATH }, expected: 'success' },

  // === ADD: add_scs_component (blueprint_path + component_class + component_name) ===
  { scenario: 'ADD: add_scs_component', toolName: 'manage_blueprint', arguments: { action: 'add_scs_component', blueprintPath: BP_PATH, componentClass: 'PointLightComponent', componentName: 'TestSCSComp' }, expected: 'success|already exists' },

  // === DELETE: remove_scs_component (blueprintPath + componentName) ===
  { scenario: 'DELETE: remove_scs_component', toolName: 'manage_blueprint', arguments: { action: 'remove_scs_component', blueprintPath: BP_PATH, componentName: 'TestSCSComp' }, expected: 'success|not found' },

  // === ACTION: reparent_scs_component (blueprintPath + componentName + newParent) ===
  { scenario: 'ACTION: reparent_scs_component', toolName: 'manage_blueprint', arguments: { action: 'reparent_scs_component', blueprintPath: BP_PATH, componentName: 'TestModSCSComp', newParent: 'DefaultSceneRoot' }, expected: 'success' },

  // === CONFIG: set_scs_transform (blueprintPath + componentName + location/rotation/scale) ===
  { scenario: 'CONFIG: set_scs_transform', toolName: 'manage_blueprint', arguments: { action: 'set_scs_transform', blueprintPath: BP_PATH, componentName: 'TestModSCSComp', location: { x: 100, y: 0, z: 50 } }, expected: 'success' },

  // === CONFIG: set_scs_property (blueprintPath + componentName + propertyName + propertyValue) ===
  // C++ ApplyJsonValueToProperty supports struct (FVector) via array format [x, y, z].
  { scenario: 'CONFIG: set_scs_property', toolName: 'manage_blueprint', arguments: { action: 'set_scs_property', blueprintPath: BP_PATH, componentName: 'TestModSCSComp', propertyName: 'RelativeLocation', propertyValue: [100, 0, 50] }, expected: 'success' },

  // === ACTION: ensure_exists (blueprintPath) ===
  { scenario: 'ACTION: ensure_exists', toolName: 'manage_blueprint', arguments: { action: 'ensure_exists', blueprintPath: BP_PATH }, expected: 'success' },

  // === ACTION: probe_handle (no blueprint needed - uses componentClass) ===
  { scenario: 'ACTION: probe_handle', toolName: 'manage_blueprint', arguments: { action: 'probe_handle', componentClass: 'StaticMeshComponent' }, expected: 'success', assertions: [{ path: 'structuredContent.result.hasHandles', equals: true, label: 'probe_handle gathered real handles' }] },

  // === ADD: add_variable (blueprintPath + variableName + variableType) ===
  // This variable will be renamed in the next step — do NOT delete it before rename.
  { scenario: 'ADD: add_variable', toolName: 'manage_blueprint', arguments: { action: 'add_variable', blueprintPath: BP_PATH, variableName: 'TestVariable', variableType: 'Boolean' }, expected: 'success|already exists' },

  // === ACTION: rename_variable (blueprintPath + oldName + newName) ===
  // Renames the variable added above (NOT deleted).
  { scenario: 'ACTION: rename_variable', toolName: 'manage_blueprint', arguments: { action: 'rename_variable', blueprintPath: BP_PATH, oldName: 'TestVariable', newName: 'RenamedVariable' }, expected: 'success' },

  // === CONFIG: set_variable_metadata (blueprintPath + variableName + metadata) ===
  // Operates on the RENAMED variable from the previous step.
  { scenario: 'CONFIG: set_variable_metadata', toolName: 'manage_blueprint', arguments: { action: 'set_variable_metadata', blueprintPath: BP_PATH, variableName: 'RenamedVariable', metadata: { tooltip: 'Test variable tooltip' } }, expected: 'success' },

  // === DELETE: remove_variable (blueprintPath + variableName) ===
  // Now remove the renamed variable after metadata was set.
  { scenario: 'DELETE: remove_variable', toolName: 'manage_blueprint', arguments: { action: 'remove_variable', blueprintPath: BP_PATH, variableName: 'RenamedVariable' }, expected: 'success|not found' },

  // === ADD: add_function (blueprintPath + functionName) ===
  { scenario: 'ADD: add_function', toolName: 'manage_blueprint', arguments: { action: 'add_function', blueprintPath: BP_PATH, functionName: 'TestFunction' }, expected: 'success|already exists' },

  // === ADD: add_event (blueprintPath + eventType) ===
  { scenario: 'ADD: add_event', toolName: 'manage_blueprint', arguments: { action: 'add_event', blueprintPath: BP_PATH, eventType: 'Custom', customEventName: 'TestEvent' }, expected: 'success|already exists' },

  // === DELETE: remove_event (blueprintPath + eventName) ===
  { scenario: 'DELETE: remove_event', toolName: 'manage_blueprint', arguments: { action: 'remove_event', blueprintPath: BP_PATH, eventName: 'TestEvent' }, expected: 'success|not found' },

  // === ADD: add_construction_script (blueprintPath) ===
  { scenario: 'ADD: add_construction_script', toolName: 'manage_blueprint', arguments: { action: 'add_construction_script', blueprintPath: BP_PATH }, expected: 'success|already exists' },

  // === CONFIG: set_metadata (assetPath/blueprintPath + metadata) ===
  { scenario: 'CONFIG: set_metadata', toolName: 'manage_blueprint', arguments: { action: 'set_metadata', blueprintPath: BP_PATH, metadata: { comment: 'Test metadata' } }, expected: 'success' },

  // === CREATE: create_node (blueprintPath as assetPath + nodeType + graphName) ===
  // Capture the nodeId for use in subsequent node operations.
  { scenario: 'CREATE: create_node', toolName: 'manage_blueprint', arguments: { action: 'create_node', blueprintPath: BP_PATH, nodeType: 'Sequence', graphName: 'EventGraph' }, expected: 'success|already exists', captureResult: { key: 'seqNodeId', fromField: 'nodeId' } },

  // === ADD: add_node (blueprintPath as assetPath + nodeType + nodeName) ===
  // Capture a real PrintString node for connect/default/delete operations.
  { scenario: 'ADD: add_node', toolName: 'manage_blueprint', arguments: { action: 'add_node', blueprintPath: BP_PATH, nodeType: 'PrintString', functionName: 'PrintString', nodeName: 'TestPrintNode', graphName: 'EventGraph' }, expected: 'success|already exists', captureResult: { key: 'printNodeId', fromField: 'nodeId' } },

  // === CONNECT: connect_pins (blueprintPath + sourceNode/targetNode + sourcePin/targetPin) ===
  // Uses real nodeIds captured from node creation. Sequence output pins are then_0/then_1.
  { scenario: 'CONNECT: connect_pins', toolName: 'manage_blueprint', arguments: { action: 'connect_pins', blueprintPath: BP_PATH, sourceNode: '${captured:seqNodeId}', targetNode: '${captured:printNodeId}', sourcePin: 'then_0', targetPin: 'execute', graphName: 'EventGraph' }, expected: 'success' },

  // === VERIFY: connected pin state ===
  { scenario: 'VERIFY: connected pin state', toolName: 'manage_blueprint', arguments: { action: 'get_pin_details', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', pinName: 'then_0', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.result.pins', includesObject: { pinName: 'then_0', linkedTo: { length: 1 } }, label: 'then_0 has one real graph link after connect_pins' }] },

  // === ACTION: break_pin_links (blueprintPath + nodeGuid + pinName) ===
  // Uses the real Sequence output pin that was just connected.
  { scenario: 'ACTION: break_pin_links', toolName: 'manage_blueprint', arguments: { action: 'break_pin_links', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', pinName: 'then_0', graphName: 'EventGraph' }, expected: 'success' },

  // === CONFIG: set_node_property (blueprintPath + nodeGuid + propertyName + propertyValue) ===
  // Uses the real nodeId captured from the first Sequence node.
  { scenario: 'CONFIG: set_node_property', toolName: 'manage_blueprint', arguments: { action: 'set_node_property', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', propertyName: 'Comment', propertyValue: 'Test comment', graphName: 'EventGraph' }, expected: 'success' },

  // === CREATE: create_reroute_node (blueprintPath + graphName) ===
  { scenario: 'CREATE: create_reroute_node', toolName: 'manage_blueprint', arguments: { action: 'create_reroute_node', blueprintPath: BP_PATH, graphName: 'EventGraph' }, expected: 'success|already exists', captureResult: { key: 'rerouteNodeId', fromField: 'nodeId' } },

  // === INFO: get_node_details (blueprintPath + nodeGuid + graphName) ===
  // Uses the real PrintString input data pin.
  { scenario: 'INFO: get_node_details', toolName: 'manage_blueprint', arguments: { action: 'get_node_details', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', graphName: 'EventGraph' }, expected: 'success' },

  // === INFO: get_graph_details (blueprintPath + graphName) ===
  { scenario: 'INFO: get_graph_details', toolName: 'manage_blueprint', arguments: { action: 'get_graph_details', blueprintPath: BP_PATH, graphName: 'EventGraph' }, expected: 'success' },

  // === INFO: get_pin_details (blueprintPath + nodeGuid + graphName) ===
  // Uses the real nodeId captured from the first Sequence node.
  { scenario: 'INFO: get_pin_details', toolName: 'manage_blueprint', arguments: { action: 'get_pin_details', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.result.pins', includesObject: { pinName: 'then_0', linkedTo: { length: 0 } }, label: 'then_0 links are removed after break_pin_links' }] },

  // === INFO: list_node_types (no blueprint needed) ===
  { scenario: 'INFO: list_node_types', toolName: 'manage_blueprint', arguments: { action: 'list_node_types' }, expected: 'success' },

  // === CONFIG: set_pin_default_value (blueprintPath + nodeGuid + pinName + value) ===
  // Uses the real nodeId captured from the first Sequence node.
  { scenario: 'CONFIG: set_pin_default_value', toolName: 'manage_blueprint', arguments: { action: 'set_pin_default_value', blueprintPath: BP_PATH, nodeGuid: '${captured:printNodeId}', pinName: 'InString', defaultValue: 'test', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.value', equals: 'test', label: 'set_pin_default_value returns applied value' }] },

  // === VERIFY: pin default persisted on PrintString node ===
  { scenario: 'VERIFY: pin default persisted', toolName: 'manage_blueprint', arguments: { action: 'get_pin_details', blueprintPath: BP_PATH, nodeGuid: '${captured:printNodeId}', pinName: 'InString', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.result.pins', includesObject: { pinName: 'InString', defaultValue: 'test' }, label: 'PrintString InString pin default is persisted' }] },

  // === DELETE: delete_node (blueprintPath + nodeGuid) ===
  // Delete the PrintString node after all pin operations have used it.
  { scenario: 'DELETE: delete_node', toolName: 'manage_blueprint', arguments: { action: 'delete_node', blueprintPath: BP_PATH, nodeGuid: '${captured:printNodeId}', graphName: 'EventGraph' }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test blueprint', toolName: 'manage_asset', arguments: { action: 'delete', path: BP_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-blueprint', testCases);
