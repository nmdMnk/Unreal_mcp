#!/usr/bin/env node
/**
 * manage_networking Tool Integration Tests
 * Exercises all networking actions against real Blueprint/actor targets.
 */

import { runToolTests } from '../../test-runner.mjs';

const ts = Date.now();
const TEST_FOLDER = `/Game/MCPTest/GameplayNetworking_${ts}`;
const ACTOR_BP_NAME = `BP_NetworkActor_${ts}`;
const CHARACTER_BP_NAME = `BP_NetworkCharacter_${ts}`;
const ACTOR_BP_PATH = `${TEST_FOLDER}/${ACTOR_BP_NAME}`;
const CHARACTER_BP_PATH = `${TEST_FOLDER}/${CHARACTER_BP_NAME}`;
const EXPECTED_ACTOR_BP_ASSET_PATH = ACTOR_BP_PATH;
const EXPECTED_CHARACTER_BP_ASSET_PATH = CHARACTER_BP_PATH;
const TARGET_ACTOR = `MCP_NetworkTarget_${ts}`;
const OWNER_ACTOR = `MCP_NetworkOwner_${ts}`;
const PAWN_ACTOR = `MCP_NetworkPawn_${ts}`;
const RPC_FUNCTION = `Server_DoThing_${ts}`;
const REP_NOTIFY_FUNCTION = `OnRep_NetworkValue_${ts}`;
const PREDICTION_VAR = `PredictedLocation_${ts}`;

const blueprintAssertion = (expectedPath, label) => [
  { path: 'structuredContent.result.success', equals: true, label: `${label} native success flag` },
  { path: 'structuredContent.result.existsAfter', equals: true, label: `${label} asset still exists` },
  { path: 'structuredContent.result.assetPath', equals: expectedPath, label: `${label} target package verified` }
];

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  {
    scenario: 'Setup: create replicated actor blueprint',
    toolName: 'manage_blueprint',
    arguments: { action: 'create_blueprint', name: ACTOR_BP_NAME, path: TEST_FOLDER, parentClass: 'Actor' },
    expected: 'success|already exists',
    assertions: [{ path: 'structuredContent.result.assetPath', equals: EXPECTED_ACTOR_BP_ASSET_PATH, label: 'network actor blueprint created' }]
  },
  { scenario: 'Setup: add replicated flag variable', toolName: 'manage_blueprint', arguments: { action: 'add_variable', blueprintPath: ACTOR_BP_PATH, variableName: 'ReplicatedFlag', variableType: 'Boolean' }, expected: 'success|already exists' },
  { scenario: 'Setup: add rep notify variable', toolName: 'manage_blueprint', arguments: { action: 'add_variable', blueprintPath: ACTOR_BP_PATH, variableName: 'RepNotifyValue', variableType: 'Float' }, expected: 'success|already exists' },
  { scenario: 'Setup: compile network actor blueprint', toolName: 'manage_blueprint', arguments: { action: 'compile', blueprintPath: ACTOR_BP_PATH }, expected: 'success' },
  {
    scenario: 'Setup: create network character blueprint',
    toolName: 'manage_blueprint',
    arguments: { action: 'create_blueprint', name: CHARACTER_BP_NAME, path: TEST_FOLDER, parentClass: 'Character' },
    expected: 'success|already exists',
    assertions: [{ path: 'structuredContent.result.assetPath', equals: EXPECTED_CHARACTER_BP_ASSET_PATH, label: 'network character blueprint created' }]
  },
  { scenario: 'Setup: spawn target actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: TARGET_ACTOR, location: { x: 0, y: 0, z: 100 } }, expected: 'success', assertions: [{ path: 'structuredContent.result.actorName', equals: TARGET_ACTOR, label: 'network target actor spawned' }] },
  { scenario: 'Setup: spawn owner actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: OWNER_ACTOR, location: { x: 160, y: 0, z: 100 } }, expected: 'success', assertions: [{ path: 'structuredContent.result.actorName', equals: OWNER_ACTOR, label: 'network owner actor spawned' }] },
  { scenario: 'Setup: spawn pawn actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Script/Engine.DefaultPawn', actorName: PAWN_ACTOR, location: { x: 320, y: 0, z: 140 } }, expected: 'success', assertions: [{ path: 'structuredContent.result.actorName', equals: PAWN_ACTOR, label: 'network pawn actor spawned' }] },

  // === REPLICATION ===
  { scenario: 'CONFIG: set_property_replicated', toolName: 'manage_networking', arguments: { action: 'set_property_replicated', blueprintPath: ACTOR_BP_PATH, propertyName: 'ReplicatedFlag', replicated: true }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_property_replicated') },
  { scenario: 'CONFIG: set_replication_condition', toolName: 'manage_networking', arguments: { action: 'set_replication_condition', blueprintPath: ACTOR_BP_PATH, propertyName: 'ReplicatedFlag', condition: 'COND_OwnerOnly' }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_replication_condition') },
  { scenario: 'CONFIG: configure_net_update_frequency', toolName: 'manage_networking', arguments: { action: 'configure_net_update_frequency', blueprintPath: ACTOR_BP_PATH, netUpdateFrequency: 33, minNetUpdateFrequency: 7 }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_net_update_frequency') },
  { scenario: 'CONFIG: configure_net_priority', toolName: 'manage_networking', arguments: { action: 'configure_net_priority', blueprintPath: ACTOR_BP_PATH, netPriority: 2.75 }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_net_priority') },
  { scenario: 'CONFIG: set_net_dormancy', toolName: 'manage_networking', arguments: { action: 'set_net_dormancy', blueprintPath: ACTOR_BP_PATH, dormancy: 'DORM_Awake' }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_net_dormancy') },
  {
    scenario: 'CONFIG: configure_replication_graph',
    toolName: 'manage_networking',
    arguments: { action: 'configure_replication_graph', blueprintPath: ACTOR_BP_PATH, spatiallyLoaded: true, netLoadOnClient: false, replicationPolicy: 'Spatial' },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_replication_graph'),
      { path: 'structuredContent.result.spatiallyLoaded', equals: true, label: 'replication graph spatial flag returned' },
      { path: 'structuredContent.result.netLoadOnClient', equals: false, label: 'replication graph client load flag returned' },
      { path: 'structuredContent.result.replicationPolicy', equals: 'Spatial', label: 'replication policy returned' }
    ]
  },

  // === RPCS ===
  {
    scenario: 'CREATE: create_rpc_function',
    toolName: 'manage_networking',
    arguments: { action: 'create_rpc_function', blueprintPath: ACTOR_BP_PATH, functionName: RPC_FUNCTION, rpcType: 'Server', reliable: true },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'create_rpc_function'),
      { path: 'structuredContent.result.functionName', equals: RPC_FUNCTION, label: 'RPC function name returned' },
      { path: 'structuredContent.result.rpcType', equals: 'Server', label: 'RPC type returned' },
      { path: 'structuredContent.result.reliable', equals: true, label: 'RPC reliability returned at creation' }
    ]
  },
  {
    scenario: 'CONFIG: configure_rpc_validation',
    toolName: 'manage_networking',
    arguments: { action: 'configure_rpc_validation', blueprintPath: ACTOR_BP_PATH, functionName: RPC_FUNCTION, withValidation: true },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_rpc_validation'),
      { path: 'structuredContent.result.withValidation', equals: true, label: 'RPC validation flag returned' }
    ]
  },
  {
    scenario: 'CONFIG: set_rpc_reliability',
    toolName: 'manage_networking',
    arguments: { action: 'set_rpc_reliability', blueprintPath: ACTOR_BP_PATH, functionName: RPC_FUNCTION, reliable: false },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_rpc_reliability'),
      { path: 'structuredContent.result.reliable', equals: false, label: 'RPC reliability updated' }
    ]
  },

  // === AUTHORITY / OWNERSHIP ===
  { scenario: 'CONFIG: set_owner', toolName: 'manage_networking', arguments: { action: 'set_owner', actorName: TARGET_ACTOR, ownerActorName: OWNER_ACTOR }, expected: 'success', assertions: [{ path: 'structuredContent.result.success', equals: true, label: 'set_owner native success flag' }, { path: 'structuredContent.result.actorName', equals: TARGET_ACTOR, label: 'set_owner target actor verified' }, { path: 'structuredContent.result.existsAfter', equals: true, label: 'set_owner target actor still exists' }] },
  {
    scenario: 'CONFIG: set_autonomous_proxy',
    toolName: 'manage_networking',
    arguments: { action: 'set_autonomous_proxy', blueprintPath: ACTOR_BP_PATH, isAutonomousProxy: true },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_autonomous_proxy'),
      { path: 'structuredContent.result.isAutonomousProxy', equals: true, label: 'autonomous proxy flag returned' }
    ]
  },
  { scenario: 'INFO: check_has_authority', toolName: 'manage_networking', arguments: { action: 'check_has_authority', actorName: TARGET_ACTOR }, expected: 'success', assertions: [{ path: 'structuredContent.result.success', equals: true, label: 'authority check native success flag' }, { path: 'structuredContent.result.hasAuthority', equals: true, label: 'editor actor has authority' }, { path: 'structuredContent.result.role', equals: 'ROLE_Authority', label: 'editor actor role returned' }] },
  { scenario: 'INFO: check_is_locally_controlled', toolName: 'manage_networking', arguments: { action: 'check_is_locally_controlled', actorName: PAWN_ACTOR }, expected: 'success', assertions: [{ path: 'structuredContent.result.success', equals: true, label: 'local-control check native success flag' }, { path: 'structuredContent.result.isLocallyControlled', equals: false, label: 'unpossessed editor pawn is not locally controlled' }, { path: 'structuredContent.result.isLocalController', equals: false, label: 'unpossessed editor pawn has no local controller' }] },

  // === RELEVANCY / SERIALIZATION ===
  { scenario: 'CONFIG: configure_net_cull_distance', toolName: 'manage_networking', arguments: { action: 'configure_net_cull_distance', blueprintPath: ACTOR_BP_PATH, netCullDistanceSquared: 640000, useOwnerNetRelevancy: true }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_net_cull_distance') },
  { scenario: 'CONFIG: set_always_relevant', toolName: 'manage_networking', arguments: { action: 'set_always_relevant', blueprintPath: ACTOR_BP_PATH, alwaysRelevant: true }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_always_relevant') },
  { scenario: 'CONFIG: set_only_relevant_to_owner', toolName: 'manage_networking', arguments: { action: 'set_only_relevant_to_owner', blueprintPath: ACTOR_BP_PATH, onlyRelevantToOwner: false }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_only_relevant_to_owner') },
  {
    scenario: 'CONFIG: configure_net_serialization',
    toolName: 'manage_networking',
    arguments: { action: 'configure_net_serialization', blueprintPath: ACTOR_BP_PATH, structName: 'MCPNetPayload', customSerialization: true },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_net_serialization'),
      { path: 'structuredContent.result.customSerialization', equals: true, label: 'custom serialization flag returned' },
      { path: 'structuredContent.result.structName', equals: 'MCPNetPayload', label: 'net serialization struct returned' }
    ]
  },
  { scenario: 'CONFIG: set_replicated_using', toolName: 'manage_networking', arguments: { action: 'set_replicated_using', blueprintPath: ACTOR_BP_PATH, propertyName: 'RepNotifyValue', repNotifyFunc: REP_NOTIFY_FUNCTION }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_replicated_using') },
  {
    scenario: 'CONFIG: configure_push_model',
    toolName: 'manage_networking',
    arguments: { action: 'configure_push_model', blueprintPath: ACTOR_BP_PATH, usePushModel: true },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_push_model'),
      { path: 'structuredContent.result.usePushModel', equals: true, label: 'push model flag returned' }
    ]
  },

  // === NETWORK PREDICTION ===
  {
    scenario: 'CONFIG: configure_client_prediction',
    toolName: 'manage_networking',
    arguments: { action: 'configure_client_prediction', blueprintPath: CHARACTER_BP_PATH, enablePrediction: true, predictionThreshold: 0.25 },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_CHARACTER_BP_ASSET_PATH, 'configure_client_prediction'),
      { path: 'structuredContent.result.enablePrediction', equals: true, label: 'client prediction flag returned' },
      { path: 'structuredContent.result.predictionThreshold', equals: 0.25, label: 'client prediction threshold returned' }
    ]
  },
  {
    scenario: 'CONFIG: configure_server_correction',
    toolName: 'manage_networking',
    arguments: { action: 'configure_server_correction', blueprintPath: CHARACTER_BP_PATH, correctionThreshold: 1.5, smoothingRate: 0.35 },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_CHARACTER_BP_ASSET_PATH, 'configure_server_correction'),
      { path: 'structuredContent.result.correctionThreshold', equals: 1.5, label: 'server correction threshold returned' },
      { path: 'structuredContent.result.smoothingRate', equals: 0.35, label: 'server correction smoothing rate returned' }
    ]
  },
  {
    scenario: 'ADD: add_network_prediction_data',
    toolName: 'manage_networking',
    arguments: { action: 'add_network_prediction_data', blueprintPath: CHARACTER_BP_PATH, dataType: 'Vector', variableName: PREDICTION_VAR },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_CHARACTER_BP_ASSET_PATH, 'add_network_prediction_data'),
      { path: 'structuredContent.result.variableName', equals: PREDICTION_VAR, label: 'network prediction variable returned' },
      { path: 'structuredContent.result.dataType', equals: 'Vector', label: 'network prediction data type returned' }
    ]
  },
  { scenario: 'CONFIG: configure_movement_prediction', toolName: 'manage_networking', arguments: { action: 'configure_movement_prediction', blueprintPath: CHARACTER_BP_PATH, networkSmoothingMode: 'Exponential', networkMaxSmoothUpdateDistance: 512, networkNoSmoothUpdateDistance: 768 }, expected: 'success', assertions: blueprintAssertion(EXPECTED_CHARACTER_BP_ASSET_PATH, 'configure_movement_prediction') },

  // === CONNECTION / ROLE / INFO ===
  {
    scenario: 'CONFIG: configure_net_driver',
    toolName: 'manage_networking',
    arguments: { action: 'configure_net_driver', maxClientRate: 20000, maxInternetClientRate: 12000, netServerMaxTickRate: 45 },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.success', equals: true, label: 'net driver native success flag' },
      { path: 'structuredContent.result.maxClientRate', equals: 20000, label: 'net driver max client rate returned' },
      { path: 'structuredContent.result.maxInternetClientRate', equals: 12000, label: 'net driver internet client rate returned' },
      { path: 'structuredContent.result.netServerMaxTickRate', equals: 45, label: 'net driver max tick rate returned' }
    ]
  },
  {
    scenario: 'CONFIG: set_net_role',
    toolName: 'manage_networking',
    arguments: { action: 'set_net_role', blueprintPath: ACTOR_BP_PATH, role: 'ROLE_AutonomousProxy' },
    expected: 'success',
    assertions: [
      ...blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'set_net_role'),
      { path: 'structuredContent.result.role', equals: 'ROLE_AutonomousProxy', label: 'net role returned' },
      { path: 'structuredContent.result.replicates', equals: true, label: 'proxy role enables replication' }
    ]
  },
  { scenario: 'CONFIG: configure_replicated_movement', toolName: 'manage_networking', arguments: { action: 'configure_replicated_movement', blueprintPath: ACTOR_BP_PATH, replicateMovement: true }, expected: 'success', assertions: blueprintAssertion(EXPECTED_ACTOR_BP_ASSET_PATH, 'configure_replicated_movement') },
  {
    scenario: 'INFO: get_networking_info',
    toolName: 'manage_networking',
    arguments: { action: 'get_networking_info', blueprintPath: ACTOR_BP_PATH },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.success', equals: true, label: 'networking info native success flag' },
      { path: 'structuredContent.result.networkingInfo.bReplicates', equals: true, label: 'networking info reads replicated actor CDO' },
      { path: 'structuredContent.result.networkingInfo.bAlwaysRelevant', equals: true, label: 'networking info reads always relevant flag' },
      { path: 'structuredContent.result.networkingInfo.bOnlyRelevantToOwner', equals: false, label: 'networking info reads owner-only relevancy flag' },
      { path: 'structuredContent.result.networkingInfo.netUpdateFrequency', equals: 33, label: 'networking info reads net update frequency' },
      { path: 'structuredContent.result.networkingInfo.minNetUpdateFrequency', equals: 7, label: 'networking info reads min net update frequency' },
      { path: 'structuredContent.result.networkingInfo.netCullDistanceSquared', equals: 640000, label: 'networking info reads cull distance' },
      { path: 'structuredContent.result.networkingInfo.netPriority', equals: 2.75, label: 'networking info reads net priority' },
      { path: 'structuredContent.result.networkingInfo.netDormancy', equals: 'DORM_Awake', label: 'networking info reads dormancy' }
    ]
  },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete spawned actors', toolName: 'control_actor', arguments: { action: 'delete', actorNames: [TARGET_ACTOR, OWNER_ACTOR, PAWN_ACTOR] }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-networking', testCases);
