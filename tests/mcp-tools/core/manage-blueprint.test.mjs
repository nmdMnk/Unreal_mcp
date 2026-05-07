#!/usr/bin/env node
/**
 * manage_blueprint Tool Integration Tests
 * Covers all 36 actions with proper setup/teardown sequencing.
 *
 * Every action that operates on a blueprint must include a valid
 * blueprintPath pointing to the blueprint created during setup.
 *
 * captureResult is used to capture real nodeIds from node creation
 * so that subsequent node operations (delete, connect, etc.) use
 * real GUIDs that exist in the blueprint graph.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();
const BP_NAME = `BP_Test_${ts}`;
const BP_PATH = `${TEST_FOLDER}/${BP_NAME}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create test blueprint', toolName: 'manage_blueprint', arguments: { action: 'create_blueprint', name: BP_NAME, path: TEST_FOLDER, parentClass: 'Actor' }, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.assetPath', equals: BP_PATH, label: 'create_blueprint path alias uses requested folder' }] },

  // === ACTION: create (requires name + path/blueprintPath) ===
  { scenario: 'ACTION: create', toolName: 'manage_blueprint', arguments: { action: 'create', name: `BP_Create_${ts}`, path: TEST_FOLDER, parentClass: 'Actor' }, expected: 'success|already exists' },

  // === INFO: get_blueprint (uses blueprintPath) ===
  { scenario: 'INFO: get_blueprint', toolName: 'manage_blueprint', arguments: { action: 'get_blueprint', blueprintPath: BP_PATH }, expected: 'success' },

  // === ACTION: get (uses blueprintPath via name fallback) ===
  { scenario: 'ACTION: get', toolName: 'manage_blueprint', arguments: { action: 'get', blueprintPath: BP_PATH }, expected: 'success' },

  // === ACTION: compile (uses blueprintPath) ===
  { scenario: 'ACTION: compile', toolName: 'manage_blueprint', arguments: { action: 'compile', blueprintPath: BP_PATH }, expected: 'success' },

  // === ADD: add_component (blueprintPath + componentClass + componentName) ===
  { scenario: 'ADD: add_component', toolName: 'manage_blueprint', arguments: { action: 'add_component', blueprintPath: BP_PATH, componentClass: 'PointLightComponent', componentName: 'TestLight' }, expected: 'success|already exists' },

// === CONFIG: set_default (blueprintPath + propertyName + value/propertyValue) ===
// bGenerateOverlapEvents is on UPrimitiveComponent; this Actor BP root is SceneComponent.
// Use a property that exists on AActor CDO directly.
{ scenario: 'CONFIG: set_default', toolName: 'manage_blueprint', arguments: { action: 'set_default', blueprintPath: BP_PATH, propertyName: 'bReplicates', propertyValue: true }, expected: 'success' },

  // === CONFIG: modify_scs (blueprintPath + operations) ===
  { scenario: 'CONFIG: modify_scs', toolName: 'manage_blueprint', arguments: { action: 'modify_scs', blueprintPath: BP_PATH, operations: [{ type: 'add_component', componentName: 'TestModSCSComp', componentClass: 'SceneComponent' }] }, expected: 'success|already exists' },

  // === INFO: get_scs (blueprintPath) ===
  { scenario: 'INFO: get_scs', toolName: 'manage_blueprint', arguments: { action: 'get_scs', blueprintPath: BP_PATH }, expected: 'success' },

  // === ADD: add_scs_component (blueprint_path + component_class + component_name) ===
  { scenario: 'ADD: add_scs_component', toolName: 'manage_blueprint', arguments: { action: 'add_scs_component', blueprintPath: BP_PATH, componentClass: 'PointLightComponent', componentName: 'TestSCSComp' }, expected: 'success|already exists' },

  // === DELETE: remove_scs_component (blueprintPath + componentName) ===
  { scenario: 'DELETE: remove_scs_component', toolName: 'manage_blueprint', arguments: { action: 'remove_scs_component', blueprintPath: BP_PATH, componentName: 'TestSCSComp' }, expected: 'success|not found' },

  // === ACTION: reparent_scs_component (blueprintPath + componentName + newParent) ===
  { scenario: 'ACTION: reparent_scs_component', toolName: 'manage_blueprint', arguments: { action: 'reparent_scs_component', blueprintPath: BP_PATH, componentName: 'TestModSCSComp', newParent: 'DefaultSceneRoot' }, expected: 'success' },

  // === CONFIG: set_scs_transform (blueprintPath + componentName + location/rotation/scale) ===
  { scenario: 'CONFIG: set_scs_transform', toolName: 'manage_blueprint', arguments: { action: 'set_scs_transform', blueprintPath: BP_PATH, componentName: 'TestModSCSComp', location: { x: 100, y: 0, z: 50 } }, expected: 'success' },

  // === CONFIG: set_scs_property (blueprintPath + componentName + propertyName + propertyValue) ===
  // C++ ApplyJsonValueToProperty supports struct (FVector) via array format [x, y, z].
  { scenario: 'CONFIG: set_scs_property', toolName: 'manage_blueprint', arguments: { action: 'set_scs_property', blueprintPath: BP_PATH, componentName: 'TestModSCSComp', propertyName: 'RelativeLocation', propertyValue: [100, 0, 50] }, expected: 'success' },

  // === ACTION: ensure_exists (blueprintPath) ===
  { scenario: 'ACTION: ensure_exists', toolName: 'manage_blueprint', arguments: { action: 'ensure_exists', blueprintPath: BP_PATH }, expected: 'success' },

  // === ACTION: probe_handle (no blueprint needed - uses componentClass) ===
  { scenario: 'ACTION: probe_handle', toolName: 'manage_blueprint', arguments: { action: 'probe_handle', componentClass: 'StaticMeshComponent' }, expected: 'success', assertions: [{ path: 'structuredContent.result.hasHandles', equals: true, label: 'probe_handle gathered real handles' }] },

  // === ADD: add_variable (blueprintPath + variableName + variableType) ===
  // This variable will be renamed in the next step — do NOT delete it before rename.
  { scenario: 'ADD: add_variable', toolName: 'manage_blueprint', arguments: { action: 'add_variable', blueprintPath: BP_PATH, variableName: 'TestVariable', variableType: 'Boolean' }, expected: 'success|already exists' },

  // === ACTION: rename_variable (blueprintPath + oldName + newName) ===
  // Renames the variable added above (NOT deleted).
  { scenario: 'ACTION: rename_variable', toolName: 'manage_blueprint', arguments: { action: 'rename_variable', blueprintPath: BP_PATH, oldName: 'TestVariable', newName: 'RenamedVariable' }, expected: 'success' },

  // === CONFIG: set_variable_metadata (blueprintPath + variableName + metadata) ===
  // Operates on the RENAMED variable from the previous step.
  { scenario: 'CONFIG: set_variable_metadata', toolName: 'manage_blueprint', arguments: { action: 'set_variable_metadata', blueprintPath: BP_PATH, variableName: 'RenamedVariable', metadata: { tooltip: 'Test variable tooltip' } }, expected: 'success' },

  // === DELETE: remove_variable (blueprintPath + variableName) ===
  // Now remove the renamed variable after metadata was set.
  { scenario: 'DELETE: remove_variable', toolName: 'manage_blueprint', arguments: { action: 'remove_variable', blueprintPath: BP_PATH, variableName: 'RenamedVariable' }, expected: 'success|not found' },

  // === ADD: add_function (blueprintPath + functionName) ===
  { scenario: 'ADD: add_function', toolName: 'manage_blueprint', arguments: { action: 'add_function', blueprintPath: BP_PATH, functionName: 'TestFunction' }, expected: 'success|already exists' },

  // === ADD: add_event (blueprintPath + eventType) ===
  { scenario: 'ADD: add_event', toolName: 'manage_blueprint', arguments: { action: 'add_event', blueprintPath: BP_PATH, eventType: 'Custom', customEventName: 'TestEvent' }, expected: 'success|already exists' },

  // === DELETE: remove_event (blueprintPath + eventName) ===
  { scenario: 'DELETE: remove_event', toolName: 'manage_blueprint', arguments: { action: 'remove_event', blueprintPath: BP_PATH, eventName: 'TestEvent' }, expected: 'success|not found' },

  // === ADD: add_construction_script (blueprintPath) ===
  { scenario: 'ADD: add_construction_script', toolName: 'manage_blueprint', arguments: { action: 'add_construction_script', blueprintPath: BP_PATH }, expected: 'success|already exists' },

  // === CONFIG: set_metadata (assetPath/blueprintPath + metadata) ===
  { scenario: 'CONFIG: set_metadata', toolName: 'manage_blueprint', arguments: { action: 'set_metadata', blueprintPath: BP_PATH, metadata: { comment: 'Test metadata' } }, expected: 'success' },

  // === CREATE: create_node (blueprintPath as assetPath + nodeType + graphName) ===
  // Capture the nodeId for use in subsequent node operations.
  { scenario: 'CREATE: create_node', toolName: 'manage_blueprint', arguments: { action: 'create_node', blueprintPath: BP_PATH, nodeType: 'Sequence', graphName: 'EventGraph' }, expected: 'success|already exists', captureResult: { key: 'seqNodeId', fromField: 'nodeId' } },

  // === ADD: add_node (blueprintPath as assetPath + nodeType + nodeName) ===
  // Capture a real PrintString node for connect/default/delete operations.
  { scenario: 'ADD: add_node', toolName: 'manage_blueprint', arguments: { action: 'add_node', blueprintPath: BP_PATH, nodeType: 'PrintString', functionName: 'PrintString', nodeName: 'TestPrintNode', graphName: 'EventGraph' }, expected: 'success|already exists', captureResult: { key: 'printNodeId', fromField: 'nodeId' } },

  // === CONNECT: connect_pins (blueprintPath + sourceNode/targetNode + sourcePin/targetPin) ===
  // Uses real nodeIds captured from node creation. Sequence output pins are then_0/then_1.
  { scenario: 'CONNECT: connect_pins', toolName: 'manage_blueprint', arguments: { action: 'connect_pins', blueprintPath: BP_PATH, sourceNode: '${captured:seqNodeId}', targetNode: '${captured:printNodeId}', sourcePin: 'then_0', targetPin: 'execute', graphName: 'EventGraph' }, expected: 'success' },

  // === VERIFY: connected pin state ===
  { scenario: 'VERIFY: connected pin state', toolName: 'manage_blueprint', arguments: { action: 'get_pin_details', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', pinName: 'then_0', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.result.pins', includesObject: { pinName: 'then_0', linkedTo: { length: 1 } }, label: 'then_0 has one real graph link after connect_pins' }] },

  // === ACTION: break_pin_links (blueprintPath + nodeGuid + pinName) ===
  // Uses the real Sequence output pin that was just connected.
  { scenario: 'ACTION: break_pin_links', toolName: 'manage_blueprint', arguments: { action: 'break_pin_links', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', pinName: 'then_0', graphName: 'EventGraph' }, expected: 'success' },

  // === CONFIG: set_node_property (blueprintPath + nodeGuid + propertyName + propertyValue) ===
  // Uses the real nodeId captured from the first Sequence node.
  { scenario: 'CONFIG: set_node_property', toolName: 'manage_blueprint', arguments: { action: 'set_node_property', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', propertyName: 'Comment', propertyValue: 'Test comment', graphName: 'EventGraph' }, expected: 'success' },

  // === CREATE: create_reroute_node (blueprintPath + graphName) ===
  { scenario: 'CREATE: create_reroute_node', toolName: 'manage_blueprint', arguments: { action: 'create_reroute_node', blueprintPath: BP_PATH, graphName: 'EventGraph' }, expected: 'success|already exists', captureResult: { key: 'rerouteNodeId', fromField: 'nodeId' } },

  // === INFO: get_node_details (blueprintPath + nodeGuid + graphName) ===
  // Uses the real PrintString input data pin.
  { scenario: 'INFO: get_node_details', toolName: 'manage_blueprint', arguments: { action: 'get_node_details', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', graphName: 'EventGraph' }, expected: 'success' },

  // === INFO: get_graph_details (blueprintPath + graphName) ===
  { scenario: 'INFO: get_graph_details', toolName: 'manage_blueprint', arguments: { action: 'get_graph_details', blueprintPath: BP_PATH, graphName: 'EventGraph' }, expected: 'success' },

  // === INFO: get_pin_details (blueprintPath + nodeGuid + graphName) ===
  // Uses the real nodeId captured from the first Sequence node.
  { scenario: 'INFO: get_pin_details', toolName: 'manage_blueprint', arguments: { action: 'get_pin_details', blueprintPath: BP_PATH, nodeGuid: '${captured:seqNodeId}', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.result.pins', includesObject: { pinName: 'then_0', linkedTo: { length: 0 } }, label: 'then_0 links are removed after break_pin_links' }] },

  // === INFO: list_node_types (no blueprint needed) ===
  { scenario: 'INFO: list_node_types', toolName: 'manage_blueprint', arguments: { action: 'list_node_types' }, expected: 'success' },

  // === CONFIG: set_pin_default_value (blueprintPath + nodeGuid + pinName + value) ===
  // Uses the real nodeId captured from the first Sequence node.
  { scenario: 'CONFIG: set_pin_default_value', toolName: 'manage_blueprint', arguments: { action: 'set_pin_default_value', blueprintPath: BP_PATH, nodeGuid: '${captured:printNodeId}', pinName: 'InString', defaultValue: 'test', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.value', equals: 'test', label: 'set_pin_default_value returns applied value' }] },

  // === VERIFY: pin default persisted on PrintString node ===
  { scenario: 'VERIFY: pin default persisted', toolName: 'manage_blueprint', arguments: { action: 'get_pin_details', blueprintPath: BP_PATH, nodeGuid: '${captured:printNodeId}', pinName: 'InString', graphName: 'EventGraph' }, expected: 'success', assertions: [{ path: 'structuredContent.result.pins', includesObject: { pinName: 'InString', defaultValue: 'test' }, label: 'PrintString InString pin default is persisted' }] },

  // === DELETE: delete_node (blueprintPath + nodeGuid) ===
  // Delete the PrintString node after all pin operations have used it.
  { scenario: 'DELETE: delete_node', toolName: 'manage_blueprint', arguments: { action: 'delete_node', blueprintPath: BP_PATH, nodeGuid: '${captured:printNodeId}', graphName: 'EventGraph' }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test blueprint', toolName: 'manage_asset', arguments: { action: 'delete', path: BP_PATH, force: true }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

// === WIDGET AUTHORING ACTIONS ===
{
  const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
  const ts = Date.now();
  const WIDGET_NAME = `WBP_WidgetAuthoring_${ts}`;
  const WIDGET_PATH = `${TEST_FOLDER}/${WIDGET_NAME}.${WIDGET_NAME}`;
  const ANIMATION_NAME = `IntroFade_${ts}`;

  const widgetArgs = (action, extra = {}) => ({ action, widgetPath: WIDGET_PATH, ...extra });
  const createTemplateArgs = (action, name, extra = {}) => ({ action, name: `${name}_${ts}`, path: TEST_FOLDER, ...extra });

  const addWidgetCases = [
    ['ADD: add_horizontal_box', 'add_horizontal_box', 'MainHorizontalBox'],
    ['ADD: add_vertical_box', 'add_vertical_box', 'MainVerticalBox'],
    ['ADD: add_overlay', 'add_overlay', 'MainOverlay'],
    ['ADD: add_grid_panel', 'add_grid_panel', 'InventoryGrid', { columnCount: 2, rowCount: 2 }],
    ['ADD: add_uniform_grid', 'add_uniform_grid', 'UniformGrid', { minDesiredSlotWidth: 32, minDesiredSlotHeight: 32 }],
    ['ADD: add_wrap_box', 'add_wrap_box', 'TagWrap', { wrapWidth: 256, explicitWrapWidth: true }],
    ['ADD: add_scroll_box', 'add_scroll_box', 'OptionsScroll', { orientation: 'Vertical' }],
    ['ADD: add_size_box', 'add_size_box', 'SizedPanel', { widthOverride: 300, heightOverride: 120 }],
    ['ADD: add_scale_box', 'add_scale_box', 'ScaledPanel', { stretch: 'ScaleToFit' }],
    ['ADD: add_border', 'add_border', 'FramedBorder', { brushColor: { r: 0.1, g: 0.2, b: 0.8, a: 1 } }],
    ['ADD: add_text_block', 'add_text_block', 'TitleText', { text: 'Widget Authoring Test', fontSize: 24 }],
    ['ADD: add_rich_text_block', 'add_rich_text_block', 'RichBodyText', { text: '<Rich>Body</>' }],
    ['ADD: add_image', 'add_image', 'LogoImage', { brushSize: { x: 64, y: 64 } }],
    ['ADD: add_button', 'add_button', 'PlayButton', { isEnabled: true }],
    ['ADD: add_check_box', 'add_check_box', 'OptionCheckBox', { isChecked: true }],
    ['ADD: add_slider', 'add_slider', 'VolumeSlider', { value: 0.5, minValue: 0, maxValue: 1 }],
    ['ADD: add_progress_bar', 'add_progress_bar', 'LoadingProgress', { percent: 0.75 }],
    ['ADD: add_text_input', 'add_text_input', 'NameInput', { hintText: 'Name', inputType: 'single' }],
    ['ADD: add_combo_box', 'add_combo_box', 'QualityCombo', { options: ['Low', 'High'], selectedOption: 'High' }],
    ['ADD: add_spin_box', 'add_spin_box', 'AmountSpinBox', { value: 5, minValue: 0, maxValue: 10 }],
    ['ADD: add_list_view', 'add_list_view', 'InventoryList'],
    ['ADD: add_tree_view', 'add_tree_view', 'QuestTree'],
  ].map(([scenario, action, slotName, extra = {}]) => ({
    scenario,
    toolName: 'manage_blueprint',
    arguments: widgetArgs(action, { slotName, parentSlot: 'RootCanvas', ...extra }),
    expected: 'success|already exists',
  }));

  const layoutCases = [
    ['CONFIG: set_anchor', 'set_anchor', { preset: 'TopCenter' }],
    ['CONFIG: set_alignment', 'set_alignment', { alignment: { x: 0.5, y: 0 } }],
    ['CONFIG: set_position', 'set_position', { position: { x: 80, y: 40 } }],
    ['CONFIG: set_size', 'set_size', { size: { x: 420, y: 72 } }],
    ['CONFIG: set_padding', 'set_padding', { padding: 8 }],
    ['CONFIG: set_z_order', 'set_z_order', { zOrder: 10 }],
    ['CONFIG: set_render_transform', 'set_render_transform', { translation: { x: 4, y: 2 }, scale: { x: 1, y: 1 }, angle: 0 }],
    ['CONFIG: set_visibility', 'set_visibility', { visibility: 'Visible' }],
    ['CONFIG: set_style', 'set_style', { propertyName: 'RenderOpacity', value: '0.9' }],
    ['CONFIG: set_clipping', 'set_clipping', { clipping: 'Inherit' }],
  ].map(([scenario, action, extra]) => ({
    scenario,
    toolName: 'manage_blueprint',
    arguments: widgetArgs(action, { slotName: 'TitleText', ...extra }),
    expected: 'success',
  }));

  const bindingCases = [
    ['CREATE: create_property_binding', 'create_property_binding', 'TitleText', { propertyName: 'Text', functionName: 'GetTitleText' }],
    ['CONNECT: bind_text', 'bind_text', 'TitleText', { bindingSource: 'GetTitleText' }],
    ['CONNECT: bind_visibility', 'bind_visibility', 'TitleText', { bindingSource: 'GetTitleVisibility' }],
    ['CONNECT: bind_color', 'bind_color', 'TitleText', { bindingSource: 'GetTitleColor' }],
    ['CONNECT: bind_enabled', 'bind_enabled', 'PlayButton', { bindingSource: 'CanPlay' }],
    ['CONNECT: bind_on_clicked', 'bind_on_clicked', 'PlayButton', { functionName: 'HandlePlayClicked' }],
    ['CONNECT: bind_on_hovered', 'bind_on_hovered', 'PlayButton', { onHoveredFunction: 'HandlePlayHovered', onUnhoveredFunction: 'HandlePlayUnhovered' }],
    ['CONNECT: bind_on_value_changed', 'bind_on_value_changed', 'VolumeSlider', { functionName: 'HandleVolumeChanged' }],
  ].map(([scenario, action, slotName, extra]) => ({
    scenario,
    toolName: 'manage_blueprint',
    arguments: widgetArgs(action, { slotName, ...extra }),
    expected: 'success',
  }));

  const hudElementCases = [
    ['ADD: add_health_bar', 'add_health_bar', { parentName: 'HUDCanvas', x: 20, y: 20, width: 240, height: 28 }],
    ['ADD: add_ammo_counter', 'add_ammo_counter', { parentName: 'HUDCanvas' }],
    ['ADD: add_minimap', 'add_minimap', { parentName: 'HUDCanvas', size: 160 }],
    ['ADD: add_crosshair', 'add_crosshair', { parentName: 'HUDCanvas', size: 32 }],
    ['ADD: add_compass', 'add_compass', { parentName: 'HUDCanvas' }],
    ['ADD: add_interaction_prompt', 'add_interaction_prompt', { parentName: 'HUDCanvas', promptFormat: 'Press E' }],
    ['ADD: add_objective_tracker', 'add_objective_tracker', { parentName: 'HUDCanvas', maxVisibleObjectives: 3 }],
    ['ADD: add_damage_indicator', 'add_damage_indicator', { parentName: 'HUDCanvas', fadeTime: 1.0 }],
  ].map(([scenario, action, extra]) => ({
    scenario,
    toolName: 'manage_blueprint',
    arguments: widgetArgs(action, extra),
    expected: 'success|already exists',
  }));

  testCases.push(
    // === SETUP ===
    { scenario: 'Setup: clear stale widget test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'error|ASSET_NOT_FOUND|success|not found' },
    { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
    { scenario: 'Setup: create test widget blueprint', toolName: 'manage_blueprint', arguments: { action: 'create_widget_blueprint', name: WIDGET_NAME, path: TEST_FOLDER, parentClass: 'UserWidget' }, expected: 'success|already exists' },

    // === CREATE ===
    { scenario: 'CREATE: create_widget_blueprint', toolName: 'manage_blueprint', arguments: { action: 'create_widget_blueprint', name: `WBP_CreateWidget_${ts}`, path: TEST_FOLDER, parentClass: 'UserWidget' }, expected: 'success|already exists' },
    { scenario: 'CONFIG: set_widget_parent_class', toolName: 'manage_blueprint', arguments: widgetArgs('set_widget_parent_class', { parentClass: 'UserWidget' }), expected: 'success' },

    // === ADD ===
    { scenario: 'ADD: add_canvas_panel', toolName: 'manage_blueprint', arguments: widgetArgs('add_canvas_panel', { slotName: 'RootCanvas' }), expected: 'success|already exists' },
    ...addWidgetCases,

    // === CONFIG ===
    ...layoutCases,

    // === CONNECT ===
    ...bindingCases,

    // === ANIMATION ===
    { scenario: 'CREATE: create_widget_animation', toolName: 'manage_blueprint', arguments: widgetArgs('create_widget_animation', { animationName: ANIMATION_NAME, duration: 1.25 }), expected: 'success|already exists' },
    { scenario: 'ADD: add_animation_track', toolName: 'manage_blueprint', arguments: widgetArgs('add_animation_track', { animationName: ANIMATION_NAME, slotName: 'TitleText', trackType: 'opacity', propertyName: 'RenderOpacity' }), expected: 'success|already exists' },
    { scenario: 'ADD: add_animation_keyframe', toolName: 'manage_blueprint', arguments: widgetArgs('add_animation_keyframe', { animationName: ANIMATION_NAME, slotName: 'TitleText', time: 0.25, value: 0.5, interpolation: 'linear' }), expected: 'success' },
    { scenario: 'CONFIG: set_animation_loop', toolName: 'manage_blueprint', arguments: widgetArgs('set_animation_loop', { animationName: ANIMATION_NAME, loopCount: 1, playMode: 'forward' }), expected: 'success' },

    // === TEMPLATES ===
    { scenario: 'CREATE: create_main_menu', toolName: 'manage_blueprint', arguments: widgetArgs('create_main_menu', { title: 'Main Menu' }), expected: 'success' },
    { scenario: 'CREATE: create_pause_menu', toolName: 'manage_blueprint', arguments: widgetArgs('create_pause_menu'), expected: 'success' },
    { scenario: 'CREATE: create_settings_menu', toolName: 'manage_blueprint', arguments: createTemplateArgs('create_settings_menu', 'WBP_SettingsMenu', { settingsType: 'all' }), expected: 'success|already exists' },
    { scenario: 'CREATE: create_loading_screen', toolName: 'manage_blueprint', arguments: createTemplateArgs('create_loading_screen', 'WBP_LoadingScreen', { includeProgressBar: true }), expected: 'success|already exists' },
    { scenario: 'CREATE: create_hud_widget', toolName: 'manage_blueprint', arguments: widgetArgs('create_hud_widget'), expected: 'success' },
    ...hudElementCases,
    { scenario: 'CREATE: create_inventory_ui', toolName: 'manage_blueprint', arguments: createTemplateArgs('create_inventory_ui', 'WBP_InventoryUI', { gridSize: { columns: 6, rows: 4 } }), expected: 'success|already exists' },
    { scenario: 'CREATE: create_dialog_widget', toolName: 'manage_blueprint', arguments: createTemplateArgs('create_dialog_widget', 'WBP_DialogWidget', { showSpeakerName: true }), expected: 'success|already exists' },
    { scenario: 'CREATE: create_radial_menu', toolName: 'manage_blueprint', arguments: createTemplateArgs('create_radial_menu', 'WBP_RadialMenu', { segmentCount: 8 }), expected: 'success|already exists' },

    // === INFO ===
    { scenario: 'INFO: get_widget_info', toolName: 'manage_blueprint', arguments: widgetArgs('get_widget_info'), expected: 'success' },
    { scenario: 'ACTION: preview_widget', toolName: 'manage_blueprint', arguments: widgetArgs('preview_widget', { previewSize: '720p' }), expected: 'success' },

    // === CLEANUP ===
    { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
  );
}

runToolTests('manage-blueprint', testCases);
