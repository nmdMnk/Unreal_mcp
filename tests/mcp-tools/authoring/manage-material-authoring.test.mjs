#!/usr/bin/env node
/**
 * manage_material_authoring Tool Integration Tests
 * Exercises real material, material function, and material instance mutations.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();

const MATERIAL_NAME = `Testmaterial_${ts}`;
const MATERIAL_PATH = `${TEST_FOLDER}/${MATERIAL_NAME}`;
const FUNCTION_NAME = `Testmaterial_function_${ts}`;
const FUNCTION_PATH = `${TEST_FOLDER}/${FUNCTION_NAME}`;
const INSTANCE_NAME = `Testmaterial_instance_${ts}`;
const INSTANCE_PATH = `${TEST_FOLDER}/${INSTANCE_NAME}`;
const LANDSCAPE_MATERIAL_NAME = `Testlandscape_material_${ts}`;
const LANDSCAPE_MATERIAL_PATH = `${TEST_FOLDER}/${LANDSCAPE_MATERIAL_NAME}`;
const LANDSCAPE_LAYER_PATH = `${LANDSCAPE_MATERIAL_PATH}/Grass`;
const DECAL_MATERIAL_NAME = `Testdecal_material_${ts}`;
const DECAL_MATERIAL_PATH = `${TEST_FOLDER}/${DECAL_MATERIAL_NAME}`;
const POST_PROCESS_MATERIAL_NAME = `Testpost_process_material_${ts}`;
const POST_PROCESS_MATERIAL_PATH = `${TEST_FOLDER}/${POST_PROCESS_MATERIAL_NAME}`;
const TEXTURE_NAME = `Testmaterial_texture_${ts}`;
const TEXTURE_PATH = `${TEST_FOLDER}/${TEXTURE_NAME}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create texture parameter asset', toolName: 'manage_texture', arguments: { action: 'create_noise_texture', name: TEXTURE_NAME, path: TEST_FOLDER, width: 32, height: 32 }, expected: 'success|already exists' },

  // === CREATE ===
  { scenario: 'CREATE: create_material', toolName: 'manage_material_authoring', arguments: { action: 'create_material', name: MATERIAL_NAME, path: TEST_FOLDER, materialDomain: 'Surface', blendMode: 'Opaque', shadingModel: 'DefaultLit' }, expected: 'success|already exists' },

  // === CONFIG ===
  { scenario: 'CONFIG: set_blend_mode', toolName: 'manage_material_authoring', arguments: { action: 'set_blend_mode', assetPath: MATERIAL_PATH, blendMode: 'Masked' }, expected: 'success' },
  { scenario: 'CONFIG: set_shading_model', toolName: 'manage_material_authoring', arguments: { action: 'set_shading_model', assetPath: MATERIAL_PATH, shadingModel: 'DefaultLit' }, expected: 'success' },
  { scenario: 'CONFIG: set_material_domain', toolName: 'manage_material_authoring', arguments: { action: 'set_material_domain', assetPath: MATERIAL_PATH, domain: 'Surface' }, expected: 'success' },

  // === ADD ===
  { scenario: 'ADD: add_texture_sample', toolName: 'manage_material_authoring', arguments: { action: 'add_texture_sample', assetPath: MATERIAL_PATH, texturePath: TEXTURE_PATH, parameterName: 'AlbedoTex', x: -600, y: -300 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_texture_coordinate', toolName: 'manage_material_authoring', arguments: { action: 'add_texture_coordinate', assetPath: MATERIAL_PATH, coordinateIndex: 0, uTiling: 1, vTiling: 1, x: -800, y: -300 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_scalar_parameter', toolName: 'manage_material_authoring', arguments: { action: 'add_scalar_parameter', assetPath: MATERIAL_PATH, parameterName: 'RoughnessParam', defaultValue: 0.5, group: 'MCP', x: -400, y: 120 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_vector_parameter', toolName: 'manage_material_authoring', arguments: { action: 'add_vector_parameter', assetPath: MATERIAL_PATH, parameterName: 'TintParam', defaultValue: { r: 0.1, g: 0.4, b: 0.8, a: 1 }, group: 'MCP', x: -400, y: 260 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_static_switch_parameter', toolName: 'manage_material_authoring', arguments: { action: 'add_static_switch_parameter', assetPath: MATERIAL_PATH, parameterName: 'UseDetailParam', defaultValue: true, group: 'MCP', x: -400, y: 400 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_math_node', toolName: 'manage_material_authoring', arguments: { action: 'add_math_node', assetPath: MATERIAL_PATH, operation: 'Multiply', constA: 0.5, constB: 2, x: -100, y: 120 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_world_position', toolName: 'manage_material_authoring', arguments: { action: 'add_world_position', assetPath: MATERIAL_PATH, x: -100, y: -450 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_vertex_normal', toolName: 'manage_material_authoring', arguments: { action: 'add_vertex_normal', assetPath: MATERIAL_PATH, x: -100, y: -320 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_pixel_depth', toolName: 'manage_material_authoring', arguments: { action: 'add_pixel_depth', assetPath: MATERIAL_PATH, x: -100, y: -190 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_fresnel', toolName: 'manage_material_authoring', arguments: { action: 'add_fresnel', assetPath: MATERIAL_PATH, x: -100, y: -60 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_reflection_vector', toolName: 'manage_material_authoring', arguments: { action: 'add_reflection_vector', assetPath: MATERIAL_PATH, x: -100, y: 70 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_panner', toolName: 'manage_material_authoring', arguments: { action: 'add_panner', assetPath: MATERIAL_PATH, speedX: 0.25, speedY: 0.5, x: -100, y: 200 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_rotator', toolName: 'manage_material_authoring', arguments: { action: 'add_rotator', assetPath: MATERIAL_PATH, speed: 0.2, x: -100, y: 330 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_noise', toolName: 'manage_material_authoring', arguments: { action: 'add_noise', assetPath: MATERIAL_PATH, scale: 8, levels: 2, x: 150, y: -320 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_voronoi', toolName: 'manage_material_authoring', arguments: { action: 'add_voronoi', assetPath: MATERIAL_PATH, scale: 8, x: 150, y: -190 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_if', toolName: 'manage_material_authoring', arguments: { action: 'add_if', assetPath: MATERIAL_PATH, x: 150, y: -60 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_switch', toolName: 'manage_material_authoring', arguments: { action: 'add_switch', assetPath: MATERIAL_PATH, x: 150, y: 70 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_custom_expression', toolName: 'manage_material_authoring', arguments: { action: 'add_custom_expression', assetPath: MATERIAL_PATH, code: 'return 0.25;', outputType: 'Float1', description: 'MCP test custom expression', x: 150, y: 200 }, expected: 'success|already exists' },

  // === CONNECT ===
  { scenario: 'CONNECT: connect_nodes', toolName: 'manage_material_authoring', arguments: { action: 'connect_nodes', assetPath: MATERIAL_PATH, sourceNodeId: 'RoughnessParam', targetNodeId: 'Main', inputName: 'Roughness' }, expected: 'success' },
  { scenario: 'ACTION: disconnect_nodes', toolName: 'manage_material_authoring', arguments: { action: 'disconnect_nodes', assetPath: MATERIAL_PATH, nodeId: 'Main', pinName: 'Roughness' }, expected: 'success' },

  // === MATERIAL FUNCTIONS ===
  { scenario: 'CREATE: create_material_function', toolName: 'manage_material_authoring', arguments: { action: 'create_material_function', name: FUNCTION_NAME, path: TEST_FOLDER, description: 'MCP material function test' }, expected: 'success|already exists' },
  { scenario: 'ADD: add_function_input', toolName: 'manage_material_authoring', arguments: { action: 'add_function_input', functionPath: FUNCTION_PATH, inputName: 'InputColor', inputType: 'Vector3', x: -250, y: 0 }, expected: 'success|already exists' },
  { scenario: 'ADD: add_function_output', toolName: 'manage_material_authoring', arguments: { action: 'add_function_output', functionPath: FUNCTION_PATH, inputName: 'OutputColor', inputType: 'Vector3', x: 250, y: 0 }, expected: 'success|already exists' },
  { scenario: 'ACTION: use_material_function', toolName: 'manage_material_authoring', arguments: { action: 'use_material_function', assetPath: MATERIAL_PATH, functionPath: FUNCTION_PATH, x: 350, y: 250 }, expected: 'success' },

  // === MATERIAL INSTANCES ===
  { scenario: 'CREATE: create_material_instance', toolName: 'manage_material_authoring', arguments: { action: 'create_material_instance', name: INSTANCE_NAME, path: TEST_FOLDER, parentMaterial: MATERIAL_PATH }, expected: 'success|already exists' },
  { scenario: 'CONFIG: set_scalar_parameter_value', toolName: 'manage_material_authoring', arguments: { action: 'set_scalar_parameter_value', instancePath: INSTANCE_PATH, parameterName: 'RoughnessParam', value: 0.35 }, expected: 'success' },
  { scenario: 'CONFIG: set_vector_parameter_value', toolName: 'manage_material_authoring', arguments: { action: 'set_vector_parameter_value', instancePath: INSTANCE_PATH, parameterName: 'TintParam', value: { r: 0.8, g: 0.2, b: 0.1, a: 1 } }, expected: 'success' },
  { scenario: 'CONFIG: set_texture_parameter_value', toolName: 'manage_material_authoring', arguments: { action: 'set_texture_parameter_value', instancePath: INSTANCE_PATH, parameterName: 'AlbedoTex', texturePath: TEXTURE_PATH }, expected: 'success' },

  // === SPECIALIZED MATERIALS ===
  { scenario: 'CREATE: create_landscape_material', toolName: 'manage_material_authoring', arguments: { action: 'create_landscape_material', name: LANDSCAPE_MATERIAL_NAME, path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_decal_material', toolName: 'manage_material_authoring', arguments: { action: 'create_decal_material', name: DECAL_MATERIAL_NAME, path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_post_process_material', toolName: 'manage_material_authoring', arguments: { action: 'create_post_process_material', name: POST_PROCESS_MATERIAL_NAME, path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'ADD: add_landscape_layer', toolName: 'manage_material_authoring', arguments: { action: 'add_landscape_layer', assetPath: LANDSCAPE_MATERIAL_PATH, layerName: 'Grass', blendType: 'LB_WeightBlend' }, expected: 'success|already exists' },
  { scenario: 'CONFIG: configure_layer_blend', toolName: 'manage_material_authoring', arguments: { action: 'configure_layer_blend', assetPath: LANDSCAPE_MATERIAL_PATH, layers: [{ name: 'Grass', blendType: 'LB_WeightBlend' }, { name: 'Rock', blendType: 'LB_HeightBlend' }] }, expected: 'success' },
  { scenario: 'ACTION: compile_material', toolName: 'manage_material_authoring', arguments: { action: 'compile_material', assetPath: MATERIAL_PATH }, expected: 'success' },
  { scenario: 'INFO: get_material_info', toolName: 'manage_material_authoring', arguments: { action: 'get_material_info', assetPath: MATERIAL_PATH }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete material instance', toolName: 'manage_asset', arguments: { action: 'delete', path: INSTANCE_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete authored material', toolName: 'manage_asset', arguments: { action: 'delete', path: MATERIAL_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete material function', toolName: 'manage_asset', arguments: { action: 'delete', path: FUNCTION_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete landscape layer', toolName: 'manage_asset', arguments: { action: 'delete', path: LANDSCAPE_LAYER_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete landscape material', toolName: 'manage_asset', arguments: { action: 'delete', path: LANDSCAPE_MATERIAL_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete decal material', toolName: 'manage_asset', arguments: { action: 'delete', path: DECAL_MATERIAL_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete post process material', toolName: 'manage_asset', arguments: { action: 'delete', path: POST_PROCESS_MATERIAL_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete texture asset', toolName: 'manage_asset', arguments: { action: 'delete', path: TEXTURE_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-material-authoring', testCases);
