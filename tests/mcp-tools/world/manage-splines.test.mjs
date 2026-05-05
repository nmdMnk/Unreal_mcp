#!/usr/bin/env node
/**
 * manage_splines Tool Integration Tests
 * Covers all 22 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const ts = Date.now();
const TEST_FOLDER = `/Game/MCPTest/WorldAssets_${ts}`;
const SPLINE_ACTOR = `SplineActor_${ts}`;
const SPLINE_MESH_BP = `BP_SplineMesh_${ts}`;
const SPLINE_MESH_BP_PATH = `${TEST_FOLDER}/${SPLINE_MESH_BP}`;
const SPLINE_MESH_ACTOR = `SplineMeshActor_${ts}`;
const SPLINE_MESH_COMPONENT = 'SplineMeshComp';
const TEST_MESH = `${TEST_FOLDER}/SM_SplineTest_${ts}`;
const TEST_MESH_OBJECT = `${TEST_MESH}.SM_SplineTest_${ts}`;
const TEST_MATERIAL = `${TEST_FOLDER}/M_SplineTest_${ts}`;
const TEST_MATERIAL_OBJECT = `${TEST_MATERIAL}.M_SplineTest_${ts}`;
const ROAD_SPLINE = `RoadSpline_${ts}`;
const RIVER_SPLINE = `RiverSpline_${ts}`;
const FENCE_SPLINE = `FenceSpline_${ts}`;
const WALL_SPLINE = `WallSpline_${ts}`;
const CABLE_SPLINE = `CableSpline_${ts}`;
const PIPE_SPLINE = `PipeSpline_${ts}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: `TestActor_${ts}`, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },
  { scenario: 'Setup: duplicate spline test mesh', toolName: 'manage_asset', arguments: { action: 'duplicate', sourcePath: '/Engine/EngineMeshes/Cube', destinationPath: TEST_MESH }, expected: 'success|already exists' },
  { scenario: 'Setup: create spline test material', toolName: 'manage_asset', arguments: { action: 'create_material', name: `M_SplineTest_${ts}`, path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create spline mesh blueprint', toolName: 'manage_blueprint', arguments: { action: 'create_blueprint', name: SPLINE_MESH_BP, path: TEST_FOLDER, parentClass: 'Actor' }, expected: 'success|already exists' },

  // === CREATE ===
  { scenario: 'CREATE: create_spline_actor', toolName: 'manage_splines', arguments: { action: 'create_spline_actor', actorName: SPLINE_ACTOR, location: { x: 0, y: 0, z: 0 }, initialPoints: [{ location: { x: 0, y: 0, z: 0 } }, { location: { x: 300, y: 0, z: 0 } }], splineType: 'Curve' }, expected: 'success|already exists' },
  // === ADD ===
  { scenario: 'ADD: add_spline_point', toolName: 'manage_splines', arguments: { action: 'add_spline_point', actorName: SPLINE_ACTOR, position: { x: 600, y: 120, z: 0 }, pointType: 'Curve' }, expected: 'success|already exists' },
  // === DELETE ===
  { scenario: 'DELETE: remove_spline_point', toolName: 'manage_splines', arguments: { action: 'remove_spline_point', actorName: SPLINE_ACTOR, pointIndex: 2 }, expected: 'success|not found' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_spline_point_position', toolName: 'manage_splines', arguments: { action: 'set_spline_point_position', actorName: SPLINE_ACTOR, pointIndex: 1, position: { x: 350, y: 80, z: 0 } }, expected: 'success' },
  { scenario: 'CONFIG: set_spline_point_tangents', toolName: 'manage_splines', arguments: { action: 'set_spline_point_tangents', actorName: SPLINE_ACTOR, pointIndex: 1, arriveTangent: { x: 100, y: 25, z: 0 }, leaveTangent: { x: 100, y: 25, z: 0 } }, expected: 'success' },
  { scenario: 'CONFIG: set_spline_point_rotation', toolName: 'manage_splines', arguments: { action: 'set_spline_point_rotation', actorName: SPLINE_ACTOR, pointIndex: 1, pointRotation: { pitch: 0, yaw: 20, roll: 0 } }, expected: 'success' },
  { scenario: 'CONFIG: set_spline_point_scale', toolName: 'manage_splines', arguments: { action: 'set_spline_point_scale', actorName: SPLINE_ACTOR, pointIndex: 1, pointScale: { x: 1.25, y: 1.25, z: 1 } }, expected: 'success' },
  { scenario: 'CONFIG: set_spline_type', toolName: 'manage_splines', arguments: { action: 'set_spline_type', actorName: SPLINE_ACTOR, splineType: 'Linear' }, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_spline_mesh_component', toolName: 'manage_splines', arguments: { action: 'create_spline_mesh_component', blueprintPath: SPLINE_MESH_BP_PATH, componentName: SPLINE_MESH_COMPONENT, meshPath: TEST_MESH_OBJECT, forwardAxis: 'X', save: true }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn spline mesh blueprint actor', toolName: 'control_actor', arguments: { action: 'spawn_blueprint', blueprintPath: SPLINE_MESH_BP_PATH, actorName: SPLINE_MESH_ACTOR, location: { x: 300, y: 300, z: 0 } }, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_spline_mesh_asset', toolName: 'manage_splines', arguments: { action: 'set_spline_mesh_asset', actorName: SPLINE_MESH_ACTOR, componentName: SPLINE_MESH_COMPONENT, meshPath: TEST_MESH_OBJECT }, expected: 'success' },
  { scenario: 'CONFIG: configure_spline_mesh_axis', toolName: 'manage_splines', arguments: { action: 'configure_spline_mesh_axis', actorName: SPLINE_MESH_ACTOR, componentName: SPLINE_MESH_COMPONENT, forwardAxis: 'Y' }, expected: 'success' },
  { scenario: 'CONFIG: set_spline_mesh_material', toolName: 'manage_splines', arguments: { action: 'set_spline_mesh_material', actorName: SPLINE_MESH_ACTOR, componentName: SPLINE_MESH_COMPONENT, materialPath: TEST_MATERIAL_OBJECT, materialIndex: 0 }, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: scatter_meshes_along_spline', toolName: 'manage_splines', arguments: { action: 'scatter_meshes_along_spline', actorName: SPLINE_ACTOR, meshPath: TEST_MESH_OBJECT, spacing: 100, alignToSpline: true }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_mesh_spacing', toolName: 'manage_splines', arguments: { action: 'configure_mesh_spacing', spacing: 125, useRandomOffset: true, randomOffsetRange: 10 }, expected: 'success' },
  { scenario: 'CONFIG: configure_mesh_randomization', toolName: 'manage_splines', arguments: { action: 'configure_mesh_randomization', randomizeScale: true, minScale: 0.9, maxScale: 1.1, randomizeRotation: true, rotationRange: 45 }, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_road_spline', toolName: 'manage_splines', arguments: { action: 'create_road_spline', actorName: ROAD_SPLINE, location: { x: 0, y: 500, z: 0 } }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_river_spline', toolName: 'manage_splines', arguments: { action: 'create_river_spline', actorName: RIVER_SPLINE, location: { x: 0, y: 650, z: 0 } }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_fence_spline', toolName: 'manage_splines', arguments: { action: 'create_fence_spline', actorName: FENCE_SPLINE, location: { x: 0, y: 800, z: 0 } }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_wall_spline', toolName: 'manage_splines', arguments: { action: 'create_wall_spline', actorName: WALL_SPLINE, location: { x: 0, y: 950, z: 0 } }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_cable_spline', toolName: 'manage_splines', arguments: { action: 'create_cable_spline', actorName: CABLE_SPLINE, location: { x: 0, y: 1100, z: 0 } }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_pipe_spline', toolName: 'manage_splines', arguments: { action: 'create_pipe_spline', actorName: PIPE_SPLINE, location: { x: 0, y: 1250, z: 0 } }, expected: 'success|already exists' },
  // === INFO ===
  { scenario: 'INFO: get_splines_info', toolName: 'manage_splines', arguments: { action: 'get_splines_info', actorName: SPLINE_ACTOR }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: `TestActor_${ts}` }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: SPLINE_ACTOR }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete spline mesh actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: SPLINE_MESH_ACTOR }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete road spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: ROAD_SPLINE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete river spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: RIVER_SPLINE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete fence spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: FENCE_SPLINE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete wall spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: WALL_SPLINE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete cable spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: CABLE_SPLINE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete pipe spline actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: PIPE_SPLINE }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete spline mesh blueprint', toolName: 'manage_asset', arguments: { action: 'delete', path: SPLINE_MESH_BP_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete spline test mesh', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_MESH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete spline test material', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_MATERIAL, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-splines', testCases);
