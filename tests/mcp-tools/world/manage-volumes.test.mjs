#!/usr/bin/env node
/**
 * manage_volumes Tool Integration Tests
 * Covers all 28 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/WorldAssets';
const ts = Date.now();
const TEST_ACTOR = `TestActor_${ts}`;
const TRIGGER_VOLUME = 'Testtrigger_volume';
const BLOCKING_VOLUME = 'Testblocking_volume';
const KILL_Z_VOLUME = 'Testkill_z_volume';
const PHYSICS_VOLUME = 'Testphysics_volume';
const CULL_DISTANCE_VOLUME = 'Testcull_distance_volume';
const POST_PROCESS_VOLUME = 'Testpost_process_volume';

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: TEST_ACTOR, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },

  // === CREATE ===
  { scenario: 'CREATE: create_trigger_volume', toolName: 'manage_volumes', arguments: {"action": "create_trigger_volume", "volumeName": TRIGGER_VOLUME, "location": {"x": 0, "y": 0, "z": 0}, "extent": {"x": 100, "y": 100, "z": 100}}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_trigger_volume', toolName: 'manage_volumes', arguments: {"action": "add_trigger_volume", "actorPath": TEST_ACTOR, "volumeName": `${TRIGGER_VOLUME}_Actor`}, expected: 'success|already exists' },
  // === CREATE ===
  { scenario: 'CREATE: create_trigger_box', toolName: 'manage_volumes', arguments: {"action": "create_trigger_box", "volumeName": "Testtrigger_box", "boxExtent": {"x": 100, "y": 100, "z": 100}}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_trigger_sphere', toolName: 'manage_volumes', arguments: {"action": "create_trigger_sphere", "volumeName": "Testtrigger_sphere", "radius": 100}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_trigger_capsule', toolName: 'manage_volumes', arguments: {"action": "create_trigger_capsule", "volumeName": "Testtrigger_capsule", "radius": 50, "halfHeight": 100}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_blocking_volume', toolName: 'manage_volumes', arguments: {"action": "create_blocking_volume", "volumeName": BLOCKING_VOLUME, "extent": {"x": 100, "y": 100, "z": 100}}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_blocking_volume', toolName: 'manage_volumes', arguments: {"action": "add_blocking_volume", "actorPath": TEST_ACTOR, "volumeName": `${BLOCKING_VOLUME}_Actor`}, expected: 'success|already exists' },
  // === CREATE ===
  { scenario: 'CREATE: create_kill_z_volume', toolName: 'manage_volumes', arguments: {"action": "create_kill_z_volume", "volumeName": KILL_Z_VOLUME, "extent": {"x": 100, "y": 100, "z": 100}}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_kill_z_volume', toolName: 'manage_volumes', arguments: {"action": "add_kill_z_volume", "actorPath": TEST_ACTOR, "volumeName": `${KILL_Z_VOLUME}_Actor`}, expected: 'success|already exists' },
  // === CREATE ===
  { scenario: 'CREATE: create_pain_causing_volume', toolName: 'manage_volumes', arguments: {"action": "create_pain_causing_volume", "volumeName": "Testpain_causing_volume", "damagePerSec": 10}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_physics_volume', toolName: 'manage_volumes', arguments: {"action": "create_physics_volume", "volumeName": PHYSICS_VOLUME, "bWaterVolume": false, "fluidFriction": 0.3}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_physics_volume', toolName: 'manage_volumes', arguments: {"action": "add_physics_volume", "actorPath": TEST_ACTOR, "volumeName": `${PHYSICS_VOLUME}_Actor`}, expected: 'success|already exists' },
  // === CREATE ===
  { scenario: 'CREATE: create_audio_volume', toolName: 'manage_volumes', arguments: {"action": "create_audio_volume", "volumeName": "Testaudio_volume", "bEnabled": true}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_reverb_volume', toolName: 'manage_volumes', arguments: {"action": "create_reverb_volume", "volumeName": "Testreverb_volume", "reverbVolume": 0.5, "fadeTime": 0.5}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_cull_distance_volume', toolName: 'manage_volumes', arguments: {"action": "create_cull_distance_volume", "volumeName": CULL_DISTANCE_VOLUME}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_cull_distance_volume', toolName: 'manage_volumes', arguments: {"action": "add_cull_distance_volume", "actorPath": TEST_ACTOR, "volumeName": `${CULL_DISTANCE_VOLUME}_Actor`}, expected: 'success|already exists' },
  // === CREATE ===
  { scenario: 'CREATE: create_precomputed_visibility_volume', toolName: 'manage_volumes', arguments: {"action": "create_precomputed_visibility_volume", "volumeName": "Testprecomputed_visibility_volume"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_lightmass_importance_volume', toolName: 'manage_volumes', arguments: {"action": "create_lightmass_importance_volume", "volumeName": "Testlightmass_importance_volume"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_nav_mesh_bounds_volume', toolName: 'manage_volumes', arguments: {"action": "create_nav_mesh_bounds_volume", "volumeName": "Testnav_mesh_bounds_volume", "extent": {"x": 500, "y": 500, "z": 200}}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_nav_modifier_volume', toolName: 'manage_volumes', arguments: {"action": "create_nav_modifier_volume", "volumeName": "Testnav_modifier_volume"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_camera_blocking_volume', toolName: 'manage_volumes', arguments: {"action": "create_camera_blocking_volume", "volumeName": "Testcamera_blocking_volume"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_post_process_volume', toolName: 'manage_volumes', arguments: {"action": "create_post_process_volume", "volumeName": POST_PROCESS_VOLUME, "priority": 0, "blendRadius": 100, "blendWeight": 1}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_post_process_volume', toolName: 'manage_volumes', arguments: {"action": "add_post_process_volume", "actorPath": TEST_ACTOR, "volumeName": `${POST_PROCESS_VOLUME}_Actor`}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_volume_extent', toolName: 'manage_volumes', arguments: {"action": "set_volume_extent", "volumeName": TRIGGER_VOLUME, "extent": {"x": 150, "y": 150, "z": 150}}, expected: 'success' },
  { scenario: 'CONFIG: set_volume_bounds', toolName: 'manage_volumes', arguments: {"action": "set_volume_bounds", "volumeName": BLOCKING_VOLUME, "bounds": [-100, -100, -100, 100, 100, 100]}, expected: 'success' },
  { scenario: 'CONFIG: set_volume_properties', toolName: 'manage_volumes', arguments: {"action": "set_volume_properties", "volumeName": PHYSICS_VOLUME, "bWaterVolume": false, "fluidFriction": 0.3, "terminalVelocity": 4000}, expected: 'success' },
  // === DELETE ===
  { scenario: 'DELETE: remove_volume', toolName: 'manage_volumes', arguments: {"action": "remove_volume", "volumeName": TRIGGER_VOLUME}, expected: 'success|not found' },
  // === INFO ===
  { scenario: 'INFO: get_volumes_info', toolName: 'manage_volumes', arguments: {"action": "get_volumes_info"}, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: TEST_ACTOR }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-volumes', testCases);
