#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/CoreAssets';
const ts = Date.now();
const projectImportSource = path.join('/data/Game/MCPtest/Saved', `mcp-manage-asset-${ts}.obj`);
const relativeImportSource = `Saved/mcp-manage-asset-${ts}.obj`;

fs.mkdirSync(path.dirname(projectImportSource), { recursive: true });
fs.writeFileSync(projectImportSource, [
  'o MCPManageAssetImport',
  'v 0 0 0',
  'v 0 100 0',
  'v 100 0 0',
  'f 1 2 3',
  ''
].join('\n'));

const asset = (name) => `${TEST_FOLDER}/${name}`;

const BASE_MATERIAL = asset(`M_AssetBase_${ts}`);
const INSTANCE = asset(`MI_AssetBase_${ts}`);
const RENDER_TARGET = `RT_Asset_${ts}`;
const IMPORTED_MESH = asset(`SM_Imported_${ts}`);
const EXISTING_STATIC_MESH = '/Game/MCPTest/TestMesh';
const DUPLICATE_SOURCE = asset(`M_DuplicateSource_${ts}`);
const DUPLICATE_DEST = asset(`M_DuplicateDest_${ts}`);
const DUPLICATE_ALIAS_SOURCE = asset(`M_DuplicateAliasSource_${ts}`);
const DUPLICATE_ALIAS_DEST = asset(`M_DuplicateAliasDest_${ts}`);
const RENAME_SOURCE = asset(`M_RenameSource_${ts}`);
const RENAME_DEST_NAME = `M_RenameDest_${ts}`;
const RENAME_ALIAS_SOURCE = asset(`M_RenameAliasSource_${ts}`);
const RENAME_ALIAS_DEST_NAME = `M_RenameAliasDest_${ts}`;
const MOVE_SOURCE = asset(`M_MoveSource_${ts}`);
const MOVE_DEST = asset(`Moved/M_MoveSource_${ts}`);
const MOVE_ALIAS_SOURCE = asset(`M_MoveAliasSource_${ts}`);
const MOVE_ALIAS_DEST = asset(`Moved/M_MoveAliasSource_${ts}`);
const DELETE_SOURCE = asset(`M_DeleteSource_${ts}`);
const DELETE_ALIAS_SOURCE = asset(`M_DeleteAliasSource_${ts}`);
const DELETE_BULK_SOURCE = asset(`M_DeleteBulkSource_${ts}`);
const BULK_RENAME_SOURCE = asset(`M_BulkRenameSource_${ts}`);
const BULK_DELETE_SOURCE = asset(`M_BulkDeleteSource_${ts}`);
const TAG_KEY = `MCPAssetTag_${ts}`;
const TAG_VALUE = 'real-live';

const createMaterial = (name) => ({
  toolName: 'manage_asset',
  arguments: { action: 'create_material', name, path: TEST_FOLDER },
  expected: 'success|already exists'
});

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create moved folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: `${TEST_FOLDER}/Moved` }, expected: 'success|already exists' },
  { scenario: 'Setup: create base material', ...createMaterial(`M_AssetBase_${ts}`) },
  { scenario: 'Setup: create duplicate source', ...createMaterial(`M_DuplicateSource_${ts}`) },
  { scenario: 'Setup: create duplicate alias source', ...createMaterial(`M_DuplicateAliasSource_${ts}`) },
  { scenario: 'Setup: create rename source', ...createMaterial(`M_RenameSource_${ts}`) },
  { scenario: 'Setup: create rename alias source', ...createMaterial(`M_RenameAliasSource_${ts}`) },
  { scenario: 'Setup: create move source', ...createMaterial(`M_MoveSource_${ts}`) },
  { scenario: 'Setup: create move alias source', ...createMaterial(`M_MoveAliasSource_${ts}`) },
  { scenario: 'Setup: create delete source', ...createMaterial(`M_DeleteSource_${ts}`) },
  { scenario: 'Setup: create delete alias source', ...createMaterial(`M_DeleteAliasSource_${ts}`) },
  { scenario: 'Setup: create bulk delete source', ...createMaterial(`M_DeleteBulkSource_${ts}`) },
  { scenario: 'Setup: create bulk rename source', ...createMaterial(`M_BulkRenameSource_${ts}`) },
  { scenario: 'Setup: create bulk delete action source', ...createMaterial(`M_BulkDeleteSource_${ts}`) },

  // === CORE ASSET ACTIONS ===
  { scenario: 'ACTION: list', toolName: 'manage_asset', arguments: { action: 'list', path: TEST_FOLDER, recursive: true }, expected: 'success' },
  { scenario: 'ACTION: import', toolName: 'manage_asset', arguments: { action: 'import', sourcePath: relativeImportSource, destinationPath: IMPORTED_MESH, overwrite: true, save: true }, expected: 'success' },
  { scenario: 'ACTION: duplicate', toolName: 'manage_asset', arguments: { action: 'duplicate', sourcePath: DUPLICATE_SOURCE, destinationPath: DUPLICATE_DEST }, expected: 'success' },
  { scenario: 'ACTION: duplicate_asset', toolName: 'manage_asset', arguments: { action: 'duplicate_asset', sourcePath: DUPLICATE_ALIAS_SOURCE, destinationPath: DUPLICATE_ALIAS_DEST }, expected: 'success' },
  { scenario: 'ACTION: rename', toolName: 'manage_asset', arguments: { action: 'rename', sourcePath: RENAME_SOURCE, newName: RENAME_DEST_NAME }, expected: 'success' },
  { scenario: 'ACTION: rename_asset', toolName: 'manage_asset', arguments: { action: 'rename_asset', sourcePath: RENAME_ALIAS_SOURCE, newName: RENAME_ALIAS_DEST_NAME }, expected: 'success' },
  { scenario: 'ACTION: move', toolName: 'manage_asset', arguments: { action: 'move', sourcePath: MOVE_SOURCE, destinationPath: MOVE_DEST }, expected: 'success' },
  { scenario: 'ACTION: move_asset', toolName: 'manage_asset', arguments: { action: 'move_asset', sourcePath: MOVE_ALIAS_SOURCE, destinationPath: MOVE_ALIAS_DEST }, expected: 'success' },

  // === DELETE VARIANTS ===
  { scenario: 'DELETE: delete', toolName: 'manage_asset', arguments: { action: 'delete', path: DELETE_SOURCE, force: true }, expected: 'success' },
  { scenario: 'DELETE: delete_asset', toolName: 'manage_asset', arguments: { action: 'delete_asset', assetPath: DELETE_ALIAS_SOURCE, force: true }, expected: 'success' },
  { scenario: 'DELETE: delete_assets', toolName: 'manage_asset', arguments: { action: 'delete_assets', assetPaths: [DELETE_BULK_SOURCE], force: true }, expected: 'success' },

  // === INFO / METADATA ===
  { scenario: 'CREATE: create_folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: `${TEST_FOLDER}/SubFolder` }, expected: 'success|already exists' },
  { scenario: 'INFO: search_assets', toolName: 'manage_asset', arguments: { action: 'search_assets', searchText: `AssetBase_${ts}`, packagePaths: [TEST_FOLDER], recursivePaths: true }, expected: 'success' },
  { scenario: 'INFO: get_dependencies', toolName: 'manage_asset', arguments: { action: 'get_dependencies', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'INFO: get_source_control_state', toolName: 'manage_asset', arguments: { action: 'get_source_control_state', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'ACTION: analyze_graph', toolName: 'manage_asset', arguments: { action: 'analyze_graph', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'INFO: get_asset_graph', toolName: 'manage_asset', arguments: { action: 'get_asset_graph', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'CREATE: create_thumbnail', toolName: 'manage_asset', arguments: { action: 'create_thumbnail', assetPath: BASE_MATERIAL, width: 64, height: 64 }, expected: 'success' },
  { scenario: 'CONFIG: set_tags', toolName: 'manage_asset', arguments: { action: 'set_tags', assetPath: BASE_MATERIAL, tags: [TAG_KEY] }, expected: 'success' },
  { scenario: 'INFO: get_metadata', toolName: 'manage_asset', arguments: { action: 'get_metadata', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'CONFIG: set_metadata', toolName: 'manage_asset', arguments: { action: 'set_metadata', assetPath: BASE_MATERIAL, metadata: { [TAG_KEY]: TAG_VALUE } }, expected: 'success' },
  { scenario: 'ACTION: validate', toolName: 'manage_asset', arguments: { action: 'validate', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'ACTION: fixup_redirectors', toolName: 'manage_asset', arguments: { action: 'fixup_redirectors', directory: TEST_FOLDER }, expected: 'success' },
  { scenario: 'INFO: find_by_tag', toolName: 'manage_asset', arguments: { action: 'find_by_tag', tag: TAG_KEY }, expected: 'success' },
  { scenario: 'ACTION: generate_report', toolName: 'manage_asset', arguments: { action: 'generate_report', directory: TEST_FOLDER, reportType: 'Summary' }, expected: 'success' },

  // === MATERIAL / MESH ACTIONS ===
  { scenario: 'CREATE: create_material', toolName: 'manage_asset', arguments: { action: 'create_material', name: `M_CreateAction_${ts}`, path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_material_instance', toolName: 'manage_asset', arguments: { action: 'create_material_instance', name: `MI_AssetBase_${ts}`, parentMaterial: BASE_MATERIAL, path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'CREATE: create_render_target', toolName: 'manage_asset', arguments: { action: 'create_render_target', name: RENDER_TARGET, path: TEST_FOLDER, width: 256, height: 256 }, expected: 'success|already exists' },
  { scenario: 'ACTION: generate_lods', toolName: 'manage_asset', arguments: { action: 'generate_lods', assetPath: EXISTING_STATIC_MESH, lodCount: 2 }, expected: 'success' },
  { scenario: 'ADD: add_material_parameter', toolName: 'manage_asset', arguments: { action: 'add_material_parameter', assetPath: BASE_MATERIAL, parameterName: `ScalarParam_${ts}`, parameterType: 'Scalar', value: 0.5 }, expected: 'success|already exists' },
  { scenario: 'INFO: list_instances', toolName: 'manage_asset', arguments: { action: 'list_instances', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'ACTION: reset_instance_parameters', toolName: 'manage_asset', arguments: { action: 'reset_instance_parameters', assetPath: INSTANCE }, expected: 'success' },
  { scenario: 'INFO: exists', toolName: 'manage_asset', arguments: { action: 'exists', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'INFO: get_material_stats', toolName: 'manage_asset', arguments: { action: 'get_material_stats', assetPath: BASE_MATERIAL }, expected: 'success' },
  { scenario: 'ACTION: nanite_rebuild_mesh', toolName: 'manage_asset', arguments: { action: 'nanite_rebuild_mesh', assetPath: EXISTING_STATIC_MESH }, expected: 'success' },
  { scenario: 'ACTION: bulk_rename', toolName: 'manage_asset', arguments: { action: 'bulk_rename', assetPaths: [BULK_RENAME_SOURCE], pattern: `M_BulkRenameSource_${ts}`, replacement: `M_BulkRenamed_${ts}` }, expected: 'success' },
  { scenario: 'ACTION: bulk_delete', toolName: 'manage_asset', arguments: { action: 'bulk_delete', assetPaths: [BULK_DELETE_SOURCE], showConfirmation: false, fixupRedirectors: false }, expected: 'success' },
  { scenario: 'ACTION: source_control_checkout', toolName: 'manage_asset', arguments: { action: 'source_control_checkout', assetPaths: [BASE_MATERIAL] }, expected: 'error|SOURCE_CONTROL_DISABLED|SC_DISABLED|success' },
  { scenario: 'ACTION: source_control_submit', toolName: 'manage_asset', arguments: { action: 'source_control_submit', assetPaths: [BASE_MATERIAL], message: 'MCP manage_asset live test' }, expected: 'error|SOURCE_CONTROL_DISABLED|SC_DISABLED|success' },

  // === MATERIAL GRAPH ACTIONS ===
  { scenario: 'ADD: add_material_node constant', toolName: 'manage_asset', arguments: { action: 'add_material_node', assetPath: BASE_MATERIAL, nodeType: 'Constant', posX: -200, posY: 0 }, expected: 'success|already exists', captureResult: { key: 'constantNodeId', fromField: 'nodeId' } },
  { scenario: 'ADD: add_material_node multiply', toolName: 'manage_asset', arguments: { action: 'add_material_node', assetPath: BASE_MATERIAL, nodeType: 'Multiply', posX: 0, posY: 0 }, expected: 'success|already exists', captureResult: { key: 'multiplyNodeId', fromField: 'nodeId' } },
  { scenario: 'CONNECT: connect_material_pins', toolName: 'manage_asset', arguments: { action: 'connect_material_pins', assetPath: BASE_MATERIAL, sourceNodeId: '${captured:constantNodeId}', sourcePin: '0', targetNodeId: '${captured:multiplyNodeId}', targetPin: 'A' }, expected: 'success' },
  { scenario: 'ACTION: break_material_connections', toolName: 'manage_asset', arguments: { action: 'break_material_connections', assetPath: BASE_MATERIAL, nodeId: '${captured:multiplyNodeId}', pinName: 'A' }, expected: 'success' },
  { scenario: 'INFO: get_material_node_details', toolName: 'manage_asset', arguments: { action: 'get_material_node_details', assetPath: BASE_MATERIAL, nodeId: '${captured:multiplyNodeId}' }, expected: 'success' },
  { scenario: 'DELETE: remove_material_node', toolName: 'manage_asset', arguments: { action: 'remove_material_node', assetPath: BASE_MATERIAL, nodeId: '${captured:multiplyNodeId}' }, expected: 'success' },
  { scenario: 'ACTION: rebuild_material', toolName: 'manage_asset', arguments: { action: 'rebuild_material', assetPath: BASE_MATERIAL }, expected: 'success' },
];

runToolTests('manage-asset', testCases);
