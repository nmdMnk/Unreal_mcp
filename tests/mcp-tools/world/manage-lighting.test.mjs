#!/usr/bin/env node
/**
 * manage_lighting Tool Integration Tests
 * Covers all 15 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/WorldAssets';
const ts = Date.now();
const TEST_ACTOR = `TestActor_${ts}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: TEST_ACTOR, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },

  // === CREATE ===
  { scenario: 'CREATE: spawn_light', toolName: 'manage_lighting', arguments: {"action": "spawn_light", "lightType": "Point", "location": {"x": 0, "y": 0, "z": 100}}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_light', toolName: 'manage_lighting', arguments: {"action": "create_light", "name": "Testlight", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: spawn_sky_light', toolName: 'manage_lighting', arguments: {"action": "spawn_sky_light", "location": {"x": 0, "y": 0, "z": 100}}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_sky_light', toolName: 'manage_lighting', arguments: {"action": "create_sky_light", "name": "Testsky_light", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: ensure_single_sky_light', toolName: 'manage_lighting', arguments: {"action": "ensure_single_sky_light"}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_lightmass_volume', toolName: 'manage_lighting', arguments: {"action": "create_lightmass_volume", "name": "Testlightmass_volume", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_lighting_enabled_level', toolName: 'manage_lighting', arguments: {"action": "create_lighting_enabled_level", "name": "Testlighting_enabled_level", "path": "/Game/MCPTest/Testlighting_enabled_level"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_dynamic_light', toolName: 'manage_lighting', arguments: {"action": "create_dynamic_light", "name": "Testdynamic_light", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: setup_global_illumination', toolName: 'manage_lighting', arguments: {"action": "setup_global_illumination", "method": "LumenGI"}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_shadows', toolName: 'manage_lighting', arguments: {"action": "configure_shadows"}, expected: 'success' },
  { scenario: 'CONFIG: set_exposure', toolName: 'manage_lighting', arguments: {"action": "set_exposure", "method": "Manual", "minBrightness": 1, "maxBrightness": 1, "compensationValue": 0}, expected: 'success' },
  { scenario: 'CONFIG: set_ambient_occlusion', toolName: 'manage_lighting', arguments: {"action": "set_ambient_occlusion", "enabled": true, "intensity": 0.5, "radius": 2000, "quality": "High"}, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: setup_volumetric_fog', toolName: 'manage_lighting', arguments: {"action": "setup_volumetric_fog"}, expected: 'success|already exists' },
  // === CREATE ===
  { scenario: 'CREATE: build_lighting', toolName: 'manage_lighting', arguments: {"action": "build_lighting"}, expected: 'success|already exists' },
  // === INFO ===
  { scenario: 'INFO: list_light_types', toolName: 'manage_lighting', arguments: {"action": "list_light_types"}, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup setup: restore test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: TEST_ACTOR, location: { x: 0, y: 0, z: 100 } }, expected: 'success|already exists' },
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: TEST_ACTOR }, expected: 'success' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-lighting', testCases);
