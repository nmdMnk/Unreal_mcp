#!/usr/bin/env node
/**
 * system_control Tool Integration Tests
 * Covers all 24 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/SystemControl';
const WIDGET_NAME = 'WBP_SystemControl_Test';
const WIDGET_PATH = `${TEST_FOLDER}/${WIDGET_NAME}`;
const VALIDATION_MATERIAL = `${TEST_FOLDER}/M_SystemControlValidation`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create validation material', toolName: 'manage_asset', arguments: { action: 'create_material', name: 'M_SystemControlValidation', path: TEST_FOLDER }, expected: 'success|already exists' },

  // === ACTION ===
  { scenario: 'ACTION: profile', toolName: 'system_control', arguments: { action: 'profile', profileType: 'cpu' }, expected: 'success' },
  { scenario: 'ACTION: show_fps', toolName: 'system_control', arguments: { action: 'show_fps', enabled: true }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_quality', toolName: 'system_control', arguments: { action: 'set_quality', category: 'ViewDistance', level: 1 }, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: screenshot', toolName: 'system_control', arguments: { action: 'screenshot', filename: 'SystemControl_NullRHI' }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_resolution', toolName: 'system_control', arguments: { action: 'set_resolution', width: 1280, height: 720, windowed: true }, expected: 'success' },
  { scenario: 'CONFIG: set_fullscreen', toolName: 'system_control', arguments: { action: 'set_fullscreen', enabled: false }, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: execute_command', toolName: 'system_control', arguments: { action: 'execute_command', command: 'stat unit' }, expected: 'success' },
  { scenario: 'ACTION: console_command', toolName: 'system_control', arguments: { action: 'console_command', command: 'stat fps' }, expected: 'success' },
  { scenario: 'ACTION: run_ubt', toolName: 'system_control', arguments: { action: 'run_ubt', target: 'MCPtestEditor', platform: 'Linux', configuration: 'Development' }, expected: 'success' },
  { scenario: 'ACTION: subscribe', toolName: 'system_control', arguments: { action: 'subscribe' }, expected: 'success' },
  { scenario: 'ACTION: unsubscribe', toolName: 'system_control', arguments: { action: 'unsubscribe' }, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: spawn_category', toolName: 'system_control', arguments: { action: 'spawn_category', categoryName: 'AI' }, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: start_session', toolName: 'system_control', arguments: { action: 'start_session', channels: 'cpu' }, expected: 'success' },
  { scenario: 'ACTION: lumen_update_scene', toolName: 'system_control', arguments: { action: 'lumen_update_scene' }, expected: 'success' },
  // === PLAYBACK ===
  { scenario: 'PLAYBACK: play_sound', toolName: 'system_control', arguments: { action: 'play_sound', volume: 0 }, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_widget', toolName: 'system_control', arguments: { action: 'create_widget', name: WIDGET_NAME, savePath: TEST_FOLDER }, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: show_widget', toolName: 'system_control', arguments: { action: 'show_widget', widgetId: 'notification', message: 'System control smoke', duration: 0.1 }, expected: 'success' },
  // === ADD ===
  { scenario: 'ADD: add_widget_child', toolName: 'system_control', arguments: { action: 'add_widget_child', widgetPath: WIDGET_PATH, childClass: 'TextBlock', name: 'SystemControlText', text: 'System control child' }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_cvar', toolName: 'system_control', arguments: { action: 'set_cvar', name: 'r.ScreenPercentage', value: '100' }, expected: 'success' },
  // === INFO ===
  { scenario: 'INFO: get_project_settings', toolName: 'system_control', arguments: { action: 'get_project_settings', section: '/Script/Engine.Engine' }, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: validate_assets', toolName: 'system_control', arguments: { action: 'validate_assets', paths: [VALIDATION_MATERIAL] }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_project_setting', toolName: 'system_control', arguments: { action: 'set_project_setting', section: '/Script/Engine.Engine', key: 'McpSystemControlSmoke', value: '1' }, expected: 'success' },
  { scenario: 'ACTION: execute_python', toolName: 'system_control', arguments: { action: 'execute_python', code: 'print("system-control-ok")' }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
  { scenario: 'ACTION: run_tests', toolName: 'system_control', arguments: { action: 'run_tests', filter: 'System.Core.Time.Comparison' }, expected: 'success' },
];

runToolTests('system-control', testCases);
