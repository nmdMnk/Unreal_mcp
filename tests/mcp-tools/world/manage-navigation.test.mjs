#!/usr/bin/env node
/**
 * manage_navigation Tool Integration Tests
 * Covers all 12 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/WorldAssets';
const ts = Date.now();
const TEST_BLUEPRINT = '/Game/MCPTest/BP_Test';
const NAV_ACTOR = 'NavTestActor';
const NAV_LINK = 'TestNavLinkProxy';
const SMART_LINK = 'TestSmartLink';
const NAV_MODIFIER = `NavModifier_${ts}`;
const OBSTACLE_AREA = '/Script/NavigationSystem.NavArea_Obstacle';

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: `TestActor_${ts}`, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },

  // === CONFIG ===
  { scenario: 'CONFIG: configure_nav_mesh_settings', toolName: 'manage_navigation', arguments: {"action": "configure_nav_mesh_settings"}, expected: 'success' },
  { scenario: 'CONFIG: set_nav_agent_properties', toolName: 'manage_navigation', arguments: {"action": "set_nav_agent_properties", "agentRadius": 35, "agentHeight": 144, "agentStepHeight": 35, "agentMaxSlope": 44}, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: rebuild_navigation', toolName: 'manage_navigation', arguments: {"action": "rebuild_navigation"}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_nav_modifier_component', toolName: 'manage_navigation', arguments: {"action": "create_nav_modifier_component", "blueprintPath": TEST_BLUEPRINT, "componentName": NAV_MODIFIER, "areaClass": OBSTACLE_AREA}, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_nav_area_class', toolName: 'manage_navigation', arguments: {"action": "set_nav_area_class", "actorName": NAV_ACTOR, "areaClass": OBSTACLE_AREA}, expected: 'success' },
  { scenario: 'CONFIG: configure_nav_area_cost', toolName: 'manage_navigation', arguments: {"action": "configure_nav_area_cost", "areaClass": OBSTACLE_AREA, "areaCost": 1.0}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_nav_link_proxy', toolName: 'manage_navigation', arguments: {"action": "create_nav_link_proxy", "actorName": NAV_LINK, "location": {"x": 0, "y": 0, "z": 100}, "startPoint": {"x": -100, "y": 0, "z": 0}, "endPoint": {"x": 100, "y": 0, "z": 0}, "direction": "BothWays"}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_nav_link', toolName: 'manage_navigation', arguments: {"action": "configure_nav_link", "actorName": NAV_LINK, "snapRadius": 30}, expected: 'success' },
  { scenario: 'CONFIG: set_nav_link_type', toolName: 'manage_navigation', arguments: {"action": "set_nav_link_type", "actorName": NAV_LINK, "linkType": "smart"}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: create_smart_link', toolName: 'manage_navigation', arguments: {"action": "create_smart_link", "actorName": SMART_LINK, "location": {"x": 0, "y": 200, "z": 100}, "startPoint": {"x": -100, "y": 0, "z": 0}, "endPoint": {"x": 100, "y": 0, "z": 0}, "direction": "BothWays"}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_smart_link_behavior', toolName: 'manage_navigation', arguments: {"action": "configure_smart_link_behavior", "actorName": SMART_LINK, "linkEnabled": true}, expected: 'success' },
  // === INFO ===
  { scenario: 'INFO: get_navigation_info', toolName: 'manage_navigation', arguments: {"action": "get_navigation_info"}, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: `TestActor_${ts}` }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-navigation', testCases);
