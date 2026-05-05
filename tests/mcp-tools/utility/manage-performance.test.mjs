#!/usr/bin/env node
/**
 * manage_performance Tool Integration Tests
 * Covers all 20 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const ts = Date.now();
const TEST_FOLDER = `/Game/MCPTest/UtilityAssets_${ts}`;
const MERGED_ACTOR_ASSET = `${TEST_FOLDER}/SM_PerformanceMerged_${ts}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },

  // === ACTION ===
  { scenario: 'ACTION: start_profiling', toolName: 'manage_performance', arguments: {"action": "start_profiling"}, expected: 'success' },
  // === PLAYBACK ===
  { scenario: 'PLAYBACK: stop_profiling', toolName: 'manage_performance', arguments: {"action": "stop_profiling"}, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: run_benchmark', toolName: 'manage_performance', arguments: {"action": "run_benchmark", "duration": 1}, expected: 'success' },
  { scenario: 'ACTION: show_fps', toolName: 'manage_performance', arguments: {"action": "show_fps"}, expected: 'success' },
  { scenario: 'ACTION: show_stats', toolName: 'manage_performance', arguments: {"action": "show_stats", "category": "Unit"}, expected: 'success' },
  { scenario: 'ACTION: generate_memory_report', toolName: 'manage_performance', arguments: {"action": "generate_memory_report"}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_scalability', toolName: 'manage_performance', arguments: {"action": "set_scalability", "level": 1, "category": "ViewDistance"}, expected: 'success' },
  { scenario: 'CONFIG: set_resolution_scale', toolName: 'manage_performance', arguments: {"action": "set_resolution_scale", "scale": 75}, expected: 'success' },
  { scenario: 'CONFIG: set_vsync', toolName: 'manage_performance', arguments: {"action": "set_vsync", "enabled": true}, expected: 'success' },
  { scenario: 'CONFIG: set_frame_rate_limit', toolName: 'manage_performance', arguments: {"action": "set_frame_rate_limit", "maxFPS": 60}, expected: 'success' },
  // === TOGGLE ===
  { scenario: 'TOGGLE: enable_gpu_timing', toolName: 'manage_performance', arguments: {"action": "enable_gpu_timing"}, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_texture_streaming', toolName: 'manage_performance', arguments: {"action": "configure_texture_streaming"}, expected: 'success' },
  { scenario: 'CONFIG: configure_lod', toolName: 'manage_performance', arguments: {"action": "configure_lod"}, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: apply_baseline_settings', toolName: 'manage_performance', arguments: {"action": "apply_baseline_settings"}, expected: 'success' },
  { scenario: 'ACTION: optimize_draw_calls', toolName: 'manage_performance', arguments: {"action": "optimize_draw_calls"}, expected: 'success' },
  { scenario: 'ACTION: merge_actors', toolName: 'manage_performance', arguments: {"action": "merge_actors", "actors": ["ParentActor", "ChildActor"], "replaceSourceActors": false, "packageName": MERGED_ACTOR_ASSET}, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_occlusion_culling', toolName: 'manage_performance', arguments: {"action": "configure_occlusion_culling"}, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: optimize_shaders', toolName: 'manage_performance', arguments: {"action": "optimize_shaders"}, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_nanite', toolName: 'manage_performance', arguments: {"action": "configure_nanite"}, expected: 'success' },
  { scenario: 'CONFIG: configure_world_partition', toolName: 'manage_performance', arguments: {"action": "configure_world_partition"}, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete merged mesh asset', toolName: 'manage_asset', arguments: { action: 'delete', path: MERGED_ACTOR_ASSET, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-performance', testCases);
