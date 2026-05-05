#!/usr/bin/env node
/**
 * manage_texture Tool Integration Tests
 * Covers all 21 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();
const NOISE_TEXTURE = `${TEST_FOLDER}/Testnoise_texture`;
const GRADIENT_TEXTURE = `${TEST_FOLDER}/Testgradient_texture`;
const PATTERN_TEXTURE = `${TEST_FOLDER}/Testpattern_texture`;
const ENGINE_CUBE = '/Engine/EngineMeshes/Cube';

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },

  // === CREATE ===
  { scenario: 'CREATE: create_noise_texture', toolName: 'manage_texture', arguments: { action: 'create_noise_texture', name: 'Testnoise_texture', path: TEST_FOLDER, width: 64, height: 64 }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_gradient_texture', toolName: 'manage_texture', arguments: { action: 'create_gradient_texture', name: 'Testgradient_texture', path: TEST_FOLDER, width: 64, height: 64 }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_pattern_texture', toolName: 'manage_texture', arguments: { action: 'create_pattern_texture', name: 'Testpattern_texture', path: TEST_FOLDER, width: 64, height: 64 }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_normal_from_height', toolName: 'manage_texture', arguments: { action: 'create_normal_from_height', sourceTexture: NOISE_TEXTURE, name: 'Testnormal_from_height', path: TEST_FOLDER, strength: 1.0 }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_ao_from_mesh', toolName: 'manage_texture', arguments: { action: 'create_ao_from_mesh', meshPath: ENGINE_CUBE, name: 'Testao_from_mesh', path: TEST_FOLDER, width: 64, height: 64, samples: 8 }, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: resize_texture', toolName: 'manage_texture', arguments: { action: 'resize_texture', sourcePath: NOISE_TEXTURE, name: `Testresize_texture_${ts}`, path: TEST_FOLDER, newWidth: 32, newHeight: 32 }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: adjust_levels', toolName: 'manage_texture', arguments: { action: 'adjust_levels', assetPath: NOISE_TEXTURE, inBlack: 0.1, inWhite: 0.9, gamma: 1.0 }, expected: 'success' },
  { scenario: 'CONFIG: adjust_curves', toolName: 'manage_texture', arguments: { action: 'adjust_curves', assetPath: NOISE_TEXTURE, curvePoints: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: blur', toolName: 'manage_texture', arguments: { action: 'blur', assetPath: NOISE_TEXTURE, radius: 1.0 }, expected: 'success' },
  { scenario: 'ACTION: sharpen', toolName: 'manage_texture', arguments: { action: 'sharpen', assetPath: NOISE_TEXTURE, amount: 0.5 }, expected: 'success' },
  { scenario: 'ACTION: invert', toolName: 'manage_texture', arguments: { action: 'invert', assetPath: NOISE_TEXTURE }, expected: 'success' },
  { scenario: 'ACTION: desaturate', toolName: 'manage_texture', arguments: { action: 'desaturate', assetPath: NOISE_TEXTURE, amount: 0.5 }, expected: 'success' },
  { scenario: 'ACTION: channel_pack', toolName: 'manage_texture', arguments: { action: 'channel_pack', name: `Testchannel_pack_${ts}`, path: TEST_FOLDER, redTexture: NOISE_TEXTURE, greenTexture: GRADIENT_TEXTURE, blueTexture: PATTERN_TEXTURE, width: 64, height: 64 }, expected: 'success' },
  { scenario: 'ACTION: channel_extract', toolName: 'manage_texture', arguments: { action: 'channel_extract', texturePath: NOISE_TEXTURE, channel: 'Red', name: `Testchannel_extract_${ts}` }, expected: 'success' },
  { scenario: 'ACTION: combine_textures', toolName: 'manage_texture', arguments: { action: 'combine_textures', name: `Testcombine_textures_${ts}`, path: TEST_FOLDER, baseTexture: NOISE_TEXTURE, blendTexture: GRADIENT_TEXTURE, blendMode: 'Multiply', opacity: 0.5 }, expected: 'success' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_compression_settings', toolName: 'manage_texture', arguments: { action: 'set_compression_settings', assetPath: NOISE_TEXTURE, compressionSettings: 'TC_Default' }, expected: 'success' },
  { scenario: 'CONFIG: set_texture_group', toolName: 'manage_texture', arguments: { action: 'set_texture_group', assetPath: NOISE_TEXTURE, textureGroup: 'TEXTUREGROUP_World' }, expected: 'success' },
  { scenario: 'CONFIG: set_lod_bias', toolName: 'manage_texture', arguments: { action: 'set_lod_bias', assetPath: NOISE_TEXTURE, lodBias: 1 }, expected: 'success' },
  { scenario: 'CONFIG: configure_virtual_texture', toolName: 'manage_texture', arguments: { action: 'configure_virtual_texture', assetPath: NOISE_TEXTURE, virtualTextureStreaming: false }, expected: 'success' },
  { scenario: 'CONFIG: set_streaming_priority', toolName: 'manage_texture', arguments: { action: 'set_streaming_priority', assetPath: NOISE_TEXTURE, neverStream: true, streamingPriority: 1 }, expected: 'success' },
  // === INFO ===
  { scenario: 'INFO: get_texture_info', toolName: 'manage_texture', arguments: { action: 'get_texture_info', assetPath: NOISE_TEXTURE }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-texture', testCases);
