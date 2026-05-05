#!/usr/bin/env node
/**
 * build_environment Tool Integration Tests
 * Covers all 23 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const ts = Date.now();
const TEST_FOLDER = `/Game/MCPTest/WorldAssets_${ts}`;
const LANDSCAPE_NAME = `TestLandscape_${ts}`;
const FOLIAGE_TYPE_NAME = `TestFoliage_${ts}`;
const FOLIAGE_TYPE_PATH = `/Game/Foliage/${FOLIAGE_TYPE_NAME}`;
const TEST_MESH = '/Engine/BasicShapes/Sphere';
const TEST_MATERIAL = '/Engine/BasicShapes/BasicShapeMaterial';

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: `TestActor_${ts}`, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },

  // === CREATE ===
  { scenario: 'CREATE: create_landscape', toolName: 'build_environment', arguments: {"action": "create_landscape", "name": LANDSCAPE_NAME, "path": TEST_FOLDER, "location": {"x": 0, "y": 0, "z": 0}}, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: sculpt', toolName: 'build_environment', arguments: {"action": "sculpt", "landscapeName": LANDSCAPE_NAME, "location": {"x": 0, "y": 0, "z": 0}, "radius": 128, "strength": 0.1, "skipFlush": true}, expected: 'success' },
  { scenario: 'ACTION: sculpt_landscape', toolName: 'build_environment', arguments: {"action": "sculpt_landscape", "landscapeName": LANDSCAPE_NAME, "location": {"x": 64, "y": 64, "z": 0}, "radius": 128, "strength": 0.1, "skipFlush": true}, expected: 'success' },
  // === ADD ===
  { scenario: 'ADD: add_foliage', toolName: 'build_environment', arguments: {"action": "add_foliage", "name": FOLIAGE_TYPE_NAME, "meshPath": TEST_MESH, "density": 10}, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: paint_foliage', toolName: 'build_environment', arguments: {"action": "paint_foliage", "foliageTypePath": FOLIAGE_TYPE_PATH, "locations": [{"x": 0, "y": 0, "z": 100}]}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_procedural_terrain', toolName: 'build_environment', arguments: {"action": "create_procedural_terrain", "name": `TestProceduralTerrain_${ts}`, "path": TEST_FOLDER}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_procedural_foliage', toolName: 'build_environment', arguments: {"action": "create_procedural_foliage", "name": `TestProceduralFoliage_${ts}`, "path": TEST_FOLDER, "foliageTypes": [{"meshPath": TEST_MESH, "density": 1}]}, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_foliage_instances', toolName: 'build_environment', arguments: {"action": "add_foliage_instances", "foliageTypePath": FOLIAGE_TYPE_PATH, "locations": [{"x": 100, "y": 0, "z": 100}]}, expected: 'success|already exists' },
  // === INFO ===
  { scenario: 'INFO: get_foliage_instances', toolName: 'build_environment', arguments: {"action": "get_foliage_instances"}, expected: 'success' },
  // === DELETE ===
  { scenario: 'DELETE: remove_foliage', toolName: 'build_environment', arguments: {"action": "remove_foliage"}, expected: 'success|not found' },
  // === ACTION ===
  { scenario: 'ACTION: paint_landscape', toolName: 'build_environment', arguments: {"action": "paint_landscape", "landscapeName": LANDSCAPE_NAME, "layerName": "TestLayer", "region": {"minX": 0, "minY": 0, "maxX": 1, "maxY": 1}, "skipFlush": true}, expected: 'success' },
  { scenario: 'ACTION: paint_landscape_layer', toolName: 'build_environment', arguments: {"action": "paint_landscape_layer", "landscapeName": LANDSCAPE_NAME, "layerName": "TestLayer", "region": {"minX": 0, "minY": 0, "maxX": 1, "maxY": 1}, "skipFlush": true}, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: modify_heightmap', toolName: 'build_environment', arguments: {"action": "modify_heightmap", "landscapeName": LANDSCAPE_NAME, "operation": "add", "heightData": [0], "region": {"minX": 0, "minY": 0, "maxX": 0, "maxY": 0}, "skipFlush": true}, expected: 'success' },
  { scenario: 'CONFIG: set_landscape_material', toolName: 'build_environment', arguments: {"action": "set_landscape_material", "landscapeName": LANDSCAPE_NAME, "materialPath": TEST_MATERIAL}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_landscape_grass_type', toolName: 'build_environment', arguments: {"action": "create_landscape_grass_type", "name": `TestLandscapeGrassType_${ts}`, "path": TEST_FOLDER, "meshPath": TEST_MESH}, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: generate_lods', toolName: 'build_environment', arguments: {"action": "generate_lods", "assetPaths": [TEST_MESH], "numLODs": 2}, expected: 'success|already exists' },
  { scenario: 'ACTION: bake_lightmap', toolName: 'build_environment', arguments: {"action": "bake_lightmap"}, expected: 'success' },
  { scenario: 'ACTION: export_snapshot', toolName: 'build_environment', arguments: {"action": "export_snapshot"}, expected: 'success' },
  { scenario: 'ACTION: import_snapshot', toolName: 'build_environment', arguments: {"action": "import_snapshot"}, expected: 'success' },
  // === DELETE ===
  { scenario: 'DELETE: delete', toolName: 'build_environment', arguments: {"action": "delete"}, expected: 'success|not found' },
  // === CREATE ===
  { scenario: 'CREATE: create_sky_sphere', toolName: 'build_environment', arguments: {"action": "create_sky_sphere", "name": `TestSkySphere_${ts}`, "path": TEST_FOLDER}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_time_of_day', toolName: 'build_environment', arguments: {"action": "set_time_of_day", "propertyName": "time_of_day", "propertyValue": 1}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_fog_volume', toolName: 'build_environment', arguments: {"action": "create_fog_volume", "name": `TestFogVolume_${ts}`, "path": TEST_FOLDER}, expected: 'success|already exists' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: `TestActor_${ts}` }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('build-environment', testCases);
