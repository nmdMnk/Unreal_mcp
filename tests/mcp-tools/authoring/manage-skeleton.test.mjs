#!/usr/bin/env node
/**
 * manage_skeleton Tool Integration Tests
 * Exercises real skeleton, socket, skin-weight, physics-asset, cloth, morph, and info actions.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const SKELETAL_MESH_PATH = '/Engine/EngineMeshes/SkeletalCube';
const ts = Date.now();

const SKELETON_PATH = `${TEST_FOLDER}/SK_Test_${ts}`;
const PHYSICS_ASSET_PATH = `${TEST_FOLDER}/PHYS_Test_${ts}`;
const ROOT_BONE = 'Root';
const MESH_BONE_A = 'Bone01';
const MESH_BONE_B = 'Bone02';
const CHILD_BONE = `McpChild_${ts}`;
const TEMP_BONE = `McpTemp_${ts}`;
const VIRTUAL_BONE = `VB_Mcp_${ts}`;
const RENAMED_VIRTUAL_BONE = `VB_McpRenamed_${ts}`;
const SOCKET_NAME = `McpSocket_${ts}`;
const MORPH_TARGET_NAME = `McpMorph_${ts}`;
const PROFILE_NAME = `McpWeights_${ts}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create test skeleton', toolName: 'manage_skeleton', arguments: { action: 'create_skeleton', path: SKELETON_PATH, rootBoneName: ROOT_BONE, save: true }, expected: 'success|already exists' },

  // === SKELETON STRUCTURE ===
  { scenario: 'ADD: add child bone', toolName: 'manage_skeleton', arguments: { action: 'add_bone', skeletonPath: SKELETON_PATH, boneName: CHILD_BONE, parentBoneName: ROOT_BONE, location: [10, 0, 0], rotation: [0, 0, 0], scale: 1, save: true }, expected: 'success|already exists' },
  { scenario: 'CREATE: create virtual bone', toolName: 'manage_skeleton', arguments: { action: 'create_virtual_bone', skeletonPath: SKELETON_PATH, sourceBoneName: ROOT_BONE, targetBoneName: CHILD_BONE, boneName: VIRTUAL_BONE, save: true }, expected: 'success|already exists' },
  { scenario: 'ACTION: rename virtual bone', toolName: 'manage_skeleton', arguments: { action: 'rename_bone', skeletonPath: SKELETON_PATH, boneName: VIRTUAL_BONE, newBoneName: RENAMED_VIRTUAL_BONE, save: true }, expected: 'success' },
  { scenario: 'CONFIG: set mesh bone transform', toolName: 'manage_skeleton', arguments: { action: 'set_bone_transform', skeletalMeshPath: SKELETAL_MESH_PATH, boneName: MESH_BONE_A, location: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], save: false }, expected: 'success' },
  { scenario: 'ADD: add temp bone', toolName: 'manage_skeleton', arguments: { action: 'add_bone', skeletonPath: SKELETON_PATH, boneName: TEMP_BONE, parentBoneName: ROOT_BONE, location: [0, 10, 0], save: true }, expected: 'success|already exists' },
  { scenario: 'CONFIG: set temp bone parent', toolName: 'manage_skeleton', arguments: { action: 'set_bone_parent', skeletonPath: SKELETON_PATH, boneName: TEMP_BONE, parentBoneName: CHILD_BONE, save: true }, expected: 'success' },
  { scenario: 'DELETE: remove temp bone', toolName: 'manage_skeleton', arguments: { action: 'remove_bone', skeletonPath: SKELETON_PATH, boneName: TEMP_BONE, removeChildren: true, save: true }, expected: 'success|not found' },

  // === SOCKETS ===
  { scenario: 'CREATE: create socket', toolName: 'manage_skeleton', arguments: { action: 'create_socket', skeletonPath: SKELETON_PATH, socketName: SOCKET_NAME, attachBoneName: CHILD_BONE, relativeLocation: [1, 2, 3], relativeRotation: [0, 45, 0], relativeScale: [1, 1, 1], save: true }, expected: 'success|already exists' },
  { scenario: 'CONFIG: configure socket', toolName: 'manage_skeleton', arguments: { action: 'configure_socket', skeletonPath: SKELETON_PATH, socketName: SOCKET_NAME, attachBoneName: CHILD_BONE, relativeLocation: [4, 5, 6], relativeRotation: [0, 90, 0], relativeScale: [1.25, 1.25, 1.25], save: true }, expected: 'success' },
  { scenario: 'INFO: list sockets', toolName: 'manage_skeleton', arguments: { action: 'list_sockets', skeletonPath: SKELETON_PATH }, expected: 'success' },

  // === SKELETON INFO ===
  { scenario: 'INFO: get skeleton info', toolName: 'manage_skeleton', arguments: { action: 'get_skeleton_info', skeletonPath: SKELETON_PATH }, expected: 'success' },
  { scenario: 'INFO: list bones', toolName: 'manage_skeleton', arguments: { action: 'list_bones', skeletonPath: SKELETON_PATH }, expected: 'success' },

  // === PHYSICS ASSET ===
  { scenario: 'CREATE: create physics asset', toolName: 'manage_skeleton', arguments: { action: 'create_physics_asset', skeletalMeshPath: SKELETAL_MESH_PATH, outputPath: PHYSICS_ASSET_PATH, save: true }, expected: 'success|already exists' },
  { scenario: 'INFO: list physics bodies', toolName: 'manage_skeleton', arguments: { action: 'list_physics_bodies', physicsAssetPath: PHYSICS_ASSET_PATH }, expected: 'success' },
  { scenario: 'ADD: add physics body A', toolName: 'manage_skeleton', arguments: { action: 'add_physics_body', physicsAssetPath: PHYSICS_ASSET_PATH, boneName: MESH_BONE_A, bodyType: 'Sphere', radius: 12, center: [0, 0, 0], save: true }, expected: 'success|already exists' },
  { scenario: 'ADD: add physics body B', toolName: 'manage_skeleton', arguments: { action: 'add_physics_body', physicsAssetPath: PHYSICS_ASSET_PATH, boneName: MESH_BONE_B, bodyType: 'Sphere', radius: 10, center: [0, 0, 0], save: true }, expected: 'success|already exists' },
  { scenario: 'CONFIG: configure physics body', toolName: 'manage_skeleton', arguments: { action: 'configure_physics_body', physicsAssetPath: PHYSICS_ASSET_PATH, boneName: MESH_BONE_A, mass: 5, linearDamping: 0.25, angularDamping: 0.5, collisionEnabled: true, simulatePhysics: false, save: true }, expected: 'success' },
  { scenario: 'ADD: add physics constraint', toolName: 'manage_skeleton', arguments: { action: 'add_physics_constraint', physicsAssetPath: PHYSICS_ASSET_PATH, bodyA: MESH_BONE_A, bodyB: MESH_BONE_B, constraintName: `McpConstraint_${ts}`, save: true }, expected: 'success|already exists' },
  { scenario: 'CONFIG: configure constraint limits', toolName: 'manage_skeleton', arguments: { action: 'configure_constraint_limits', physicsAssetPath: PHYSICS_ASSET_PATH, bodyA: MESH_BONE_A, bodyB: MESH_BONE_B, limits: { swing1LimitAngle: 30, swing2LimitAngle: 35, twistLimitAngle: 20, swing1Motion: 'Limited', swing2Motion: 'Limited', twistMotion: 'Limited' }, save: true }, expected: 'success' },

  // === SKIN WEIGHTS ===
  { scenario: 'ACTION: auto skin weights', toolName: 'manage_skeleton', arguments: { action: 'auto_skin_weights', skeletalMeshPath: SKELETAL_MESH_PATH, save: false }, expected: 'success' },
  { scenario: 'CONFIG: set vertex weights', toolName: 'manage_skeleton', arguments: { action: 'set_vertex_weights', skeletalMeshPath: SKELETAL_MESH_PATH, profileName: PROFILE_NAME, lodIndex: 0, weights: [{ vertexIndex: 0, influences: [{ boneIndex: 0, weight: 1 }] }], save: false }, expected: 'success' },
  { scenario: 'ACTION: normalize weights', toolName: 'manage_skeleton', arguments: { action: 'normalize_weights', skeletalMeshPath: SKELETAL_MESH_PATH, save: false }, expected: 'success' },
  { scenario: 'ACTION: prune weights', toolName: 'manage_skeleton', arguments: { action: 'prune_weights', skeletalMeshPath: SKELETAL_MESH_PATH, threshold: 0.01, save: false }, expected: 'success' },
  { scenario: 'ACTION: copy weights', toolName: 'manage_skeleton', arguments: { action: 'copy_weights', sourceMeshPath: SKELETAL_MESH_PATH, targetMeshPath: SKELETAL_MESH_PATH, profileName: `${PROFILE_NAME}_Copy`, lodIndex: 0 }, expected: 'success' },
  { scenario: 'ACTION: mirror weights', toolName: 'manage_skeleton', arguments: { action: 'mirror_weights', skeletalMeshPath: SKELETAL_MESH_PATH, axis: 'X', profileName: `${PROFILE_NAME}_Mirror`, lodIndex: 0, save: false }, expected: 'success' },

  // === CLOTH AND MORPHS ===
  { scenario: 'CONNECT: bind cloth to skeletal mesh', toolName: 'manage_skeleton', arguments: { action: 'bind_cloth_to_skeletal_mesh', skeletalMeshPath: SKELETAL_MESH_PATH, save: false }, expected: 'success' },
  { scenario: 'CONNECT: assign cloth asset to mesh', toolName: 'manage_skeleton', arguments: { action: 'assign_cloth_asset_to_mesh', skeletalMeshPath: SKELETAL_MESH_PATH, save: false }, expected: 'error|manual intervention|required' },
  { scenario: 'CREATE: create morph target', toolName: 'manage_skeleton', arguments: { action: 'create_morph_target', skeletalMeshPath: SKELETAL_MESH_PATH, morphTargetName: MORPH_TARGET_NAME, deltas: [{ vertexIndex: 0, positionDelta: { x: 0, y: 0, z: 1 } }], save: false }, expected: 'success|already exists' },
  { scenario: 'CONFIG: set morph target deltas', toolName: 'manage_skeleton', arguments: { action: 'set_morph_target_deltas', skeletalMeshPath: SKELETAL_MESH_PATH, morphTargetName: MORPH_TARGET_NAME, deltas: [{ vertexIndex: 0, positionDelta: { x: 0, y: 0, z: 2 } }], save: false }, expected: 'success' },
  { scenario: 'ACTION: import morph targets', toolName: 'manage_skeleton', arguments: { action: 'import_morph_targets', skeletalMeshPath: SKELETAL_MESH_PATH, morphTargetPath: SKELETAL_MESH_PATH, save: false }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-skeleton', testCases);
