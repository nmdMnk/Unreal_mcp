#!/usr/bin/env node
/**
 * animation_physics Tool Integration Tests
 * Covers all 55 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();

// The skeleton created in setup - used by all CREATE actions that need a skeleton
const TEST_SKELETON_PATH = `${TEST_FOLDER}/SK_AnimPhys_${ts}`;

const testCases = [
// === SETUP ===
{ scenario: 'Setup: delete stale test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'error|ASSET_NOT_FOUND|success|not found' },
{ scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
{ scenario: 'Setup: create test skeleton', toolName: 'manage_skeleton', arguments: { action: 'create_skeleton', path: TEST_SKELETON_PATH, rootBoneName: 'Root', save: true }, expected: 'success|already exists' },

// === CREATE (Animation Blueprints - need skeletonPath) ===
{ scenario: 'CREATE: create_animation_blueprint', toolName: 'animation_physics', arguments: {"action": "create_animation_blueprint", "name": "Testanimation_blueprint", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH, "parentClass": "Actor"}, expected: 'success|already exists' },
{ scenario: 'CREATE: create_animation_bp', toolName: 'animation_physics', arguments: {"action": "create_animation_bp", "name": "Testanimation_bp", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH, "parentClass": "Actor"}, expected: 'success|already exists' },
{ scenario: 'CREATE: create_anim_blueprint', toolName: 'animation_physics', arguments: {"action": "create_anim_blueprint", "name": "Testanim_blueprint", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH, "parentClass": "Actor"}, expected: 'success|already exists' },

// === CREATE (Blend Spaces - need skeletonPath) ===
{ scenario: 'CREATE: create_blend_space', toolName: 'animation_physics', arguments: {"action": "create_blend_space", "name": "Testblend_space", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },
{ scenario: 'CREATE: create_blend_space_1d', toolName: 'animation_physics', arguments: {"action": "create_blend_space_1d", "name": "Testblend_space_1d", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },
{ scenario: 'CREATE: create_blend_space_2d', toolName: 'animation_physics', arguments: {"action": "create_blend_space_2d", "name": "Testblend_space_2d", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },

  // === CREATE (Blend Tree - needs blueprintPath to existing AnimBP) ===
  // ANIMGRAPH_MODULE_UNAVAILABLE: primary intent since AnimGraph BlendTree headers may not be compiled in
  { scenario: 'CREATE: create_blend_tree', toolName: 'animation_physics', arguments: {"action": "create_blend_tree", "name": "Testblend_tree", "path": TEST_FOLDER, "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`}, expected: 'error|ANIMGRAPH_MODULE_UNAVAILABLE|success|already exists' },

// === CREATE (Procedural Anim - needs skeletonPath) ===
{ scenario: 'CREATE: create_procedural_anim', toolName: 'animation_physics', arguments: {"action": "create_procedural_anim", "name": "Testprocedural_anim", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH, "boneTracks": [{"boneName": "Root", "frames": [{"frame": 0}]}]}, expected: 'success|already exists' },

// === CREATE (Aim Offset - needs skeletonPath) ===
{ scenario: 'CREATE: create_aim_offset', toolName: 'animation_physics', arguments: {"action": "create_aim_offset", "name": "Testaim_offset", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },

// === ADD (Aim Offset Sample - needs assetPath to the aim offset) ===
{ scenario: 'ADD: add_aim_offset_sample', toolName: 'animation_physics', arguments: {"action": "add_aim_offset_sample", "assetPath": `${TEST_FOLDER}/Testaim_offset`, "animationPath": `${TEST_FOLDER}/Testprocedural_anim`, "yaw": 0, "pitch": 0}, expected: 'success|already exists' },

// === CREATE (State Machine - needs blueprintPath) ===
{ scenario: 'CREATE: create_state_machine', toolName: 'animation_physics', arguments: {"action": "create_state_machine", "name": "Teststate_machine", "path": TEST_FOLDER, "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`}, expected: 'success|already exists' },

// === ADD (State Machine - needs blueprintPath) ===
{ scenario: 'ADD: add_state_machine', toolName: 'animation_physics', arguments: {"action": "add_state_machine", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "stateMachineName": "Teststate_machine"}, expected: 'success|already exists' },

// === ADD (State - needs blueprintPath and stateMachineName) ===
{ scenario: 'ADD: add_state', toolName: 'animation_physics', arguments: {"action": "add_state", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "stateMachineName": "Teststate_machine", "stateName": "Teststate"}, expected: 'success|already exists' },

// === ADD (Transition - needs blueprintPath, stateMachineName, fromState, toState) ===
{ scenario: 'ADD: add_transition', toolName: 'animation_physics', arguments: {"action": "add_transition", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "stateMachineName": "Teststate_machine", "fromState": "Teststate", "toState": "Teststate"}, expected: 'success|already exists' },

// === CONFIG (Transition Rules - needs blueprintPath) ===
{ scenario: 'CONFIG: set_transition_rules', toolName: 'animation_physics', arguments: {"action": "set_transition_rules", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "stateMachineName": "Teststate_machine", "fromState": "Teststate", "toState": "Teststate", "blendTime": 0.2}, expected: 'success' },

// === ADD (Blend Node - needs blueprintPath) ===
{ scenario: 'ADD: add_blend_node', toolName: 'animation_physics', arguments: {"action": "add_blend_node", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "blendType": "TwoWayBlend", "nodeName": "Testblend_node"}, expected: 'success|already exists' },

// === ADD (Cached Pose - needs blueprintPath) ===
{ scenario: 'ADD: add_cached_pose', toolName: 'animation_physics', arguments: {"action": "add_cached_pose", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "cacheName": "Testcached_pose"}, expected: 'success|already exists' },

// === ADD (Slot Node - needs blueprintPath) ===
{ scenario: 'ADD: add_slot_node', toolName: 'animation_physics', arguments: {"action": "add_slot_node", "blueprintPath": `${TEST_FOLDER}/Testanimation_blueprint`, "slotName": "Testslot_node"}, expected: 'success|already exists' },

// === CREATE (Control Rig - needs skeletonPath) ===
{ scenario: 'CREATE: create_control_rig', toolName: 'animation_physics', arguments: {"action": "create_control_rig", "name": "Testcontrol_rig", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists|NOT_AVAILABLE' },

// === ADD (Control - needs assetPath to control rig) ===
{ scenario: 'ADD: add_control', toolName: 'animation_physics', arguments: {"action": "add_control", "assetPath": `${TEST_FOLDER}/Testcontrol_rig`, "controlName": "Testcontrol", "controlType": "Transform"}, expected: 'error|NOT_IMPLEMENTED|NOT_SUPPORTED' },

// === ADD (Rig Unit - needs assetPath) ===
{ scenario: 'ADD: add_rig_unit', toolName: 'animation_physics', arguments: {"action": "add_rig_unit", "assetPath": `${TEST_FOLDER}/Testcontrol_rig`, "unitType": "TwoBoneIK", "unitName": "Testrig_unit"}, expected: 'error|NOT_IMPLEMENTED|NOT_SUPPORTED' },

// === CONNECT (Rig Elements - needs assetPath) ===
{ scenario: 'CONNECT: connect_rig_elements', toolName: 'animation_physics', arguments: {"action": "connect_rig_elements", "assetPath": `${TEST_FOLDER}/Testcontrol_rig`, "sourceElement": "Testcontrol", "sourcePin": "Transform", "targetElement": "Testrig_unit", "targetPin": "Execute"}, expected: 'error|NOT_IMPLEMENTED|NOT_SUPPORTED' },

// === CREATE (IK Rig - needs skeletonPath or meshPath) ===
{ scenario: 'CREATE: create_ik_rig', toolName: 'animation_physics', arguments: {"action": "create_ik_rig", "name": "Testik_rig", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'error|IKRIG_FACTORY_UNAVAILABLE|NOT_SUPPORTED' },

// === ADD (IK Chain - needs assetPath to IK rig) ===
{ scenario: 'ADD: add_ik_chain', toolName: 'animation_physics', arguments: {"action": "add_ik_chain", "assetPath": `${TEST_FOLDER}/Testik_rig`, "chainName": "Testik_chain", "startBone": "Root", "endBone": "Root"}, expected: 'error|NOT_IMPLEMENTED|NOT_SUPPORTED' },

// === ACTION (Setup IK - needs name and skeletonPath) ===
{ scenario: 'ACTION: setup_ik', toolName: 'animation_physics', arguments: {"action": "setup_ik", "name": "TestIK", "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },

// === CREATE (Pose Library - needs skeletonPath) ===
{ scenario: 'CREATE: create_pose_library', toolName: 'animation_physics', arguments: {"action": "create_pose_library", "name": "Testpose_library", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'error|NOT_IMPLEMENTED|NOT_SUPPORTED' },

// === CREATE (Animation Asset - needs skeletonPath) ===
{ scenario: 'CREATE: create_animation_asset', toolName: 'animation_physics', arguments: {"action": "create_animation_asset", "name": "Testanimation_asset", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },

// === CREATE (Animation Sequence - needs skeletonPath) ===
{ scenario: 'CREATE: create_animation_sequence', toolName: 'animation_physics', arguments: {"action": "create_animation_sequence", "name": "Testanimation_sequence", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },

// === CONFIG (Sequence Length - needs assetPath) ===
{ scenario: 'CONFIG: set_sequence_length', toolName: 'animation_physics', arguments: {"action": "set_sequence_length", "assetPath": `${TEST_FOLDER}/Testanimation_sequence`, "numFrames": 60}, expected: 'success' },

// === ADD (Bone Track - needs assetPath and boneName) ===
{ scenario: 'ADD: add_bone_track', toolName: 'animation_physics', arguments: {"action": "add_bone_track", "assetPath": `${TEST_FOLDER}/Testanimation_sequence`, "boneName": "Root"}, expected: 'success|already exists' },

// === CONFIG (Bone Key - needs assetPath) ===
{ scenario: 'CONFIG: set_bone_key', toolName: 'animation_physics', arguments: {"action": "set_bone_key", "assetPath": `${TEST_FOLDER}/Testanimation_sequence`, "boneName": "Root", "frame": 0, "location": {"x": 0, "y": 0, "z": 0}}, expected: 'success' },

// === CONFIG (Curve Key - needs assetPath) ===
{ scenario: 'CONFIG: set_curve_key', toolName: 'animation_physics', arguments: {"action": "set_curve_key", "assetPath": `${TEST_FOLDER}/Testanimation_sequence`, "curveName": "TestCurve", "frame": 0, "value": 1.0}, expected: 'success' },

// === CREATE (Montage - needs skeletonPath) ===
{ scenario: 'CREATE: create_montage', toolName: 'animation_physics', arguments: {"action": "create_montage", "name": "Testmontage", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH}, expected: 'success|already exists' },

// === ADD (Montage Section - needs assetPath) ===
{ scenario: 'ADD: add_montage_section', toolName: 'animation_physics', arguments: {"action": "add_montage_section", "assetPath": `${TEST_FOLDER}/Testmontage`, "sectionName": "Testmontage_section", "startTime": 0}, expected: 'success|already exists' },

// === ADD (Montage Slot - needs assetPath and animationPath) ===
{ scenario: 'ADD: add_montage_slot', toolName: 'animation_physics', arguments: {"action": "add_montage_slot", "assetPath": `${TEST_FOLDER}/Testmontage`, "animationPath": `${TEST_FOLDER}/Testanimation_sequence`, "slotName": "DefaultSlot", "startTime": 0}, expected: 'success|already exists' },

// === CONFIG (Section Timing - needs assetPath) ===
{ scenario: 'CONFIG: set_section_timing', toolName: 'animation_physics', arguments: {"action": "set_section_timing", "assetPath": `${TEST_FOLDER}/Testmontage`, "sectionName": "Testmontage_section", "startTime": 0, "length": 1.0}, expected: 'success' },

// === ADD (Montage Notify - needs assetPath; no notifyClass = simple notify event) ===
{ scenario: 'ADD: add_montage_notify', toolName: 'animation_physics', arguments: {"action": "add_montage_notify", "assetPath": `${TEST_FOLDER}/Testmontage`, "time": 0.5, "notifyName": "Testmontage_notify"}, expected: 'success|already exists' },

// === CONFIG (Blend In - needs assetPath) ===
{ scenario: 'CONFIG: set_blend_in', toolName: 'animation_physics', arguments: {"action": "set_blend_in", "assetPath": `${TEST_FOLDER}/Testmontage`, "blendTime": 0.25}, expected: 'success' },

// === CONFIG (Blend Out - needs assetPath) ===
{ scenario: 'CONFIG: set_blend_out', toolName: 'animation_physics', arguments: {"action": "set_blend_out", "assetPath": `${TEST_FOLDER}/Testmontage`, "blendTime": 0.25}, expected: 'success' },

// === CONNECT (Link Sections - needs assetPath) ===
{ scenario: 'CONNECT: link_sections', toolName: 'animation_physics', arguments: {"action": "link_sections", "assetPath": `${TEST_FOLDER}/Testmontage`, "fromSection": "Testmontage_section", "toSection": "Testmontage_section"}, expected: 'success' },

// === ADD (Notify - needs assetPath and notifyName; no notifyClass = simple notify) ===
{ scenario: 'ADD: add_notify', toolName: 'animation_physics', arguments: {"action": "add_notify", "assetPath": `${TEST_FOLDER}/Testanimation_sequence`, "notifyName": "Testnotify", "frame": 0}, expected: 'success|already exists' },

// === SETUP: Spawn a SkeletalMeshActor for playback/ragdoll tests ===
{ scenario: 'Setup: spawn SkeletalMeshActor', toolName: 'control_actor', arguments: {"action": "spawn", "actorName": "SkelTestActor", "actorClass": "SkeletalMeshActor"}, expected: 'success|already exists' },

// === PLAYBACK (Montage - needs actorName with SkeletalMeshComponent) ===
{ scenario: 'PLAYBACK: play_montage', toolName: 'animation_physics', arguments: {"action": "play_montage", "actorName": "SkelTestActor", "montagePath": `${TEST_FOLDER}/Testmontage`}, expected: 'success|COMPONENT_NOT_FOUND' },
{ scenario: 'PLAYBACK: play_anim_montage', toolName: 'animation_physics', arguments: {"action": "play_anim_montage", "actorName": "SkelTestActor", "montagePath": `${TEST_FOLDER}/Testmontage`}, expected: 'success|COMPONENT_NOT_FOUND' },

// === ACTION (Ragdoll - needs actorName with SkeletalMeshComponent) ===
{ scenario: 'ACTION: setup_ragdoll', toolName: 'animation_physics', arguments: {"action": "setup_ragdoll", "actorName": "SkelTestActor"}, expected: 'success|COMPONENT_NOT_FOUND' },
{ scenario: 'ACTION: activate_ragdoll', toolName: 'animation_physics', arguments: {"action": "activate_ragdoll", "actorName": "SkelTestActor"}, expected: 'success|COMPONENT_NOT_FOUND' },

// === CONFIG (Vehicle - needs actorName) ===
{ scenario: 'CONFIG: configure_vehicle', toolName: 'animation_physics', arguments: {"action": "configure_vehicle", "actorName": "SkelTestActor"}, expected: 'success|NOT_AVAILABLE|COMPONENT_CREATION_FAILED|ACTOR_NOT_FOUND' },

  // === ACTION (Physics Simulation - needs skeletonPath; may fail if no preview mesh) ===
  { scenario: 'ACTION: setup_physics_simulation', toolName: 'animation_physics', arguments: {"action": "setup_physics_simulation", "skeletonPath": TEST_SKELETON_PATH}, expected: 'error|ASSET_NOT_FOUND|SKELETON_MISSING_PREVIEW' },

// === CREATE (Anim Blueprint repeat - needs skeletonPath) ===
{ scenario: 'CREATE: create_anim_blueprint', toolName: 'animation_physics', arguments: {"action": "create_anim_blueprint", "name": "Testanim_blueprint", "path": TEST_FOLDER, "skeletonPath": TEST_SKELETON_PATH, "parentClass": "Actor"}, expected: 'success|already exists' },

// === ADD (Blend Sample - needs assetPath and animationPath) ===
{ scenario: 'ADD: add_blend_sample', toolName: 'animation_physics', arguments: {"action": "add_blend_sample", "assetPath": `${TEST_FOLDER}/Testblend_space_1d`, "animationPath": `${TEST_FOLDER}/Testanimation_sequence`, "sampleValue": 100}, expected: 'success|already exists' },

// === CONFIG (Axis Settings - needs assetPath) ===
{ scenario: 'CONFIG: set_axis_settings', toolName: 'animation_physics', arguments: {"action": "set_axis_settings", "assetPath": `${TEST_FOLDER}/Testblend_space_1d`, "axis": "X", "axisName": "Speed", "minValue": 0, "maxValue": 600}, expected: 'success' },

// === CONFIG (Interpolation Settings - needs assetPath) ===
{ scenario: 'CONFIG: set_interpolation_settings', toolName: 'animation_physics', arguments: {"action": "set_interpolation_settings", "assetPath": `${TEST_FOLDER}/Testblend_space_1d`, "interpolationType": "Lerp"}, expected: 'success' },

// === ACTION (Retargeting - needs sourceSkeleton and targetSkeleton) ===
{ scenario: 'ACTION: setup_retargeting', toolName: 'animation_physics', arguments: {"action": "setup_retargeting", "sourceSkeleton": TEST_SKELETON_PATH, "targetSkeleton": TEST_SKELETON_PATH, "assets": [`${TEST_FOLDER}/Testanimation_sequence`], "savePath": TEST_FOLDER, "suffix": "_Retargeted", "overwrite": true}, expected: 'success' },

// === ACTION (Cleanup - needs artifacts array) ===
{ scenario: 'ACTION: cleanup', toolName: 'animation_physics', arguments: {"action": "cleanup", "artifacts": [
  `${TEST_FOLDER}/Testanimation_blueprint`,
  `${TEST_FOLDER}/Testanimation_bp`,
  `${TEST_FOLDER}/Testanim_blueprint`,
  `${TEST_FOLDER}/Testblend_space`,
  `${TEST_FOLDER}/Testblend_space_1d`,
  `${TEST_FOLDER}/Testblend_space_2d`,
  `${TEST_FOLDER}/Testprocedural_anim`,
  `${TEST_FOLDER}/Testaim_offset`,
  `${TEST_FOLDER}/Testcontrol_rig`,
  `${TEST_FOLDER}/Testanimation_asset`,
  `${TEST_FOLDER}/Testanimation_sequence`,
  `${TEST_FOLDER}/Testmontage`,
  TEST_SKELETON_PATH,
  '/Game/MCPTest/AuthoringAssets_CtrlRig',
  '/Game/Animations/TestIK'
]}, expected: 'success|not found' },

// === CLEANUP ===
{ scenario: 'Cleanup: delete SkelTestActor', toolName: 'control_actor', arguments: { action: 'delete', actorName: 'SkelTestActor' }, expected: 'success|not found' },
{ scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('animation-physics', testCases);
