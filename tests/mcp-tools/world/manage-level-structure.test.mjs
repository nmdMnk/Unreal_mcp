#!/usr/bin/env node
/**
 * manage_level_structure Tool Integration Tests
 * Covers all 17 actions with concrete native payload contracts.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/WorldAssets';
const ts = Date.now();
const LEVEL_NAME = `StructLevel_${ts}`;
const SUBLEVEL_NAME = `StructSublevel_${ts}`;
const LEVEL_PATH = `${TEST_FOLDER}/${LEVEL_NAME}`;
const SUBLEVEL_PATH = `${TEST_FOLDER}/${SUBLEVEL_NAME}`;
const TEST_ACTOR = `StructActor_${ts}`;
const DATA_LAYER = `StructDataLayer_${ts}`;
const HLOD_LAYER = `StructHLOD_${ts}`;
const MINIMAP_VOLUME = `StructMiniMap_${ts}`;
const LEVEL_INSTANCE = `StructLevelInstance_${ts}`;
const PACKED_LEVEL = `StructPackedLevel_${ts}`;
const SEQUENCE_NODE = `StructSequence_${ts}`;
const SEQUENCE_TARGET_NODE = `StructSequenceTarget_${ts}`;
const STREAMING_VOLUME = `StreamingVolume_${SUBLEVEL_PATH}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn actor for data layer assignment', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: TEST_ACTOR, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },

  // === CREATE ===
  { scenario: 'CREATE: create_level', toolName: 'manage_level_structure', arguments: { action: 'create_level', levelName: LEVEL_NAME, levelPath: TEST_FOLDER, bCreateWorldPartition: false, bUseExternalActors: false, save: true }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_sublevel', toolName: 'manage_level_structure', arguments: { action: 'create_sublevel', sublevelName: SUBLEVEL_NAME, sublevelPath: SUBLEVEL_PATH, parentLevel: LEVEL_PATH, save: true }, expected: 'success|already exists' },

  // === LEVEL CONFIG ===
  { scenario: 'CONFIG: configure_level_streaming', toolName: 'manage_level_structure', arguments: { action: 'configure_level_streaming', levelName: SUBLEVEL_PATH, streamingMethod: 'Blueprint', bShouldBeVisible: true, bShouldBlockOnLoad: false, bDisableDistanceStreaming: false }, expected: 'success|not found' },
  { scenario: 'CONFIG: set_streaming_distance', toolName: 'manage_level_structure', arguments: { action: 'set_streaming_distance', levelName: SUBLEVEL_PATH, streamingDistance: 5000, streamingUsage: 'Blueprint', volumeLocation: { x: 0, y: 0, z: 0 }, createVolume: true }, expected: 'success|not found' },
  { scenario: 'CONFIG: configure_level_bounds', toolName: 'manage_level_structure', arguments: { action: 'configure_level_bounds', bAutoCalculateBounds: false, boundsOrigin: { x: 0, y: 0, z: 0 }, boundsExtent: { x: 1000, y: 1000, z: 1000 } }, expected: 'success' },

  // === WORLD PARTITION GUARDED ACTIONS ===
  { scenario: 'TOGGLE: enable_world_partition', toolName: 'manage_level_structure', arguments: { action: 'enable_world_partition', bEnableWorldPartition: true }, expected: 'error|cannot enable|success' },
  { scenario: 'CONFIG: configure_grid_size', toolName: 'manage_level_structure', arguments: { action: 'configure_grid_size', gridName: 'MainGrid', gridCellSize: 12800, loadingRange: 25600, bBlockOnSlowStreaming: false, priority: 0, createIfMissing: true }, expected: 'error|not enabled|success' },
  { scenario: 'CREATE: create_data_layer', toolName: 'manage_level_structure', arguments: { action: 'create_data_layer', dataLayerName: DATA_LAYER, dataLayerType: 'Runtime', bIsInitiallyVisible: true, bIsInitiallyLoaded: true }, expected: 'error|world partition|success|already exists' },
  { scenario: 'CONNECT: assign_actor_to_data_layer', toolName: 'manage_level_structure', arguments: { action: 'assign_actor_to_data_layer', actorName: TEST_ACTOR, dataLayerName: DATA_LAYER }, expected: 'error|world partition|not found|success' },
  { scenario: 'CONFIG: configure_hlod_layer', toolName: 'manage_level_structure', arguments: { action: 'configure_hlod_layer', hlodLayerName: HLOD_LAYER, cellSize: 12800, loadingDistance: 25600, layerType: 'Instancing', bIsSpatiallyLoaded: true }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_minimap_volume', toolName: 'manage_level_structure', arguments: { action: 'create_minimap_volume', volumeName: MINIMAP_VOLUME, volumeLocation: { x: 0, y: 0, z: 0 }, volumeExtent: { x: 1000, y: 1000, z: 1000 } }, expected: 'error|world partition|success|already exists' },

  // === LEVEL BLUEPRINT ===
  { scenario: 'ACTION: open_level_blueprint', toolName: 'manage_level_structure', arguments: { action: 'open_level_blueprint', levelName: LEVEL_NAME }, expected: 'success' },
  { scenario: 'ADD: add_level_blueprint_node', toolName: 'manage_level_structure', arguments: { action: 'add_level_blueprint_node', nodeClass: 'K2Node_ExecutionSequence', nodeName: SEQUENCE_NODE, nodePosition: { x: 200, y: 100 } }, expected: 'success|already exists|not found' },
  { scenario: 'ADD: add target level blueprint node', toolName: 'manage_level_structure', arguments: { action: 'add_level_blueprint_node', nodeClass: 'K2Node_ExecutionSequence', nodeName: SEQUENCE_TARGET_NODE, nodePosition: { x: 500, y: 100 } }, expected: 'success|already exists|not found' },
  { scenario: 'CONNECT: connect_level_blueprint_nodes', toolName: 'manage_level_structure', arguments: { action: 'connect_level_blueprint_nodes', sourceNodeName: SEQUENCE_NODE, targetNodeName: SEQUENCE_TARGET_NODE, sourcePinName: 'then_0', targetPinName: 'execute' }, expected: 'success' },

  // === LEVEL INSTANCE / PACKED LEVEL ===
  { scenario: 'CREATE: create_level_instance', toolName: 'manage_level_structure', arguments: { action: 'create_level_instance', levelAssetPath: SUBLEVEL_PATH, levelInstanceName: LEVEL_INSTANCE, instanceLocation: { x: 500, y: 0, z: 0 }, instanceRotation: { pitch: 0, yaw: 0, roll: 0 }, instanceScale: { x: 1, y: 1, z: 1 } }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_packed_level_actor', toolName: 'manage_level_structure', arguments: { action: 'create_packed_level_actor', levelAssetPath: SUBLEVEL_PATH, packedLevelName: PACKED_LEVEL, instanceLocation: { x: 700, y: 0, z: 0 }, instanceRotation: { pitch: 0, yaw: 0, roll: 0 }, bPackBlueprints: true, bPackStaticMeshes: true }, expected: 'success|already exists' },

  // === INFO ===
  { scenario: 'INFO: get_level_structure_info', toolName: 'manage_level_structure', arguments: { action: 'get_level_structure_info' }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete level instance', toolName: 'control_actor', arguments: { action: 'delete', actorName: LEVEL_INSTANCE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete packed level actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: PACKED_LEVEL }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete minimap volume', toolName: 'control_actor', arguments: { action: 'delete', actorName: MINIMAP_VOLUME }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete streaming volume', toolName: 'control_actor', arguments: { action: 'delete', actorName: STREAMING_VOLUME }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: TEST_ACTOR }, expected: 'success|not found' },
  { scenario: 'Cleanup: unload sublevel', toolName: 'manage_level', arguments: { action: 'unload', levelPath: SUBLEVEL_PATH }, expected: 'success|not loaded|not found' },
  { scenario: 'Cleanup: delete created levels', toolName: 'manage_level', arguments: { action: 'delete', levelPaths: [SUBLEVEL_PATH, LEVEL_PATH] }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete data layer asset', toolName: 'manage_asset', arguments: { action: 'delete', path: `/Game/DataLayers/${DATA_LAYER}`, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete HLOD asset', toolName: 'manage_asset', arguments: { action: 'delete', path: `/Game/HLOD/${HLOD_LAYER}`, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-level-structure', testCases);
