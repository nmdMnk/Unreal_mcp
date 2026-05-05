#!/usr/bin/env node

import { runToolTests } from '../../test-runner.mjs';

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
  toolName: 'manage_widget_authoring',
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
  toolName: 'manage_widget_authoring',
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
  toolName: 'manage_widget_authoring',
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
  toolName: 'manage_widget_authoring',
  arguments: widgetArgs(action, extra),
  expected: 'success|already exists',
}));

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: clear stale widget test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'error|ASSET_NOT_FOUND|success|not found' },
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: create test widget blueprint', toolName: 'manage_widget_authoring', arguments: { action: 'create_widget_blueprint', name: WIDGET_NAME, path: TEST_FOLDER, parentClass: 'UserWidget' }, expected: 'success|already exists' },

  // === CREATE ===
  { scenario: 'CREATE: create_widget_blueprint', toolName: 'manage_widget_authoring', arguments: { action: 'create_widget_blueprint', name: `WBP_CreateWidget_${ts}`, path: TEST_FOLDER, parentClass: 'UserWidget' }, expected: 'success|already exists' },
  { scenario: 'CONFIG: set_widget_parent_class', toolName: 'manage_widget_authoring', arguments: widgetArgs('set_widget_parent_class', { parentClass: 'UserWidget' }), expected: 'success' },

  // === ADD ===
  { scenario: 'ADD: add_canvas_panel', toolName: 'manage_widget_authoring', arguments: widgetArgs('add_canvas_panel', { slotName: 'RootCanvas' }), expected: 'success|already exists' },
  ...addWidgetCases,

  // === CONFIG ===
  ...layoutCases,

  // === CONNECT ===
  ...bindingCases,

  // === ANIMATION ===
  { scenario: 'CREATE: create_widget_animation', toolName: 'manage_widget_authoring', arguments: widgetArgs('create_widget_animation', { animationName: ANIMATION_NAME, duration: 1.25 }), expected: 'success|already exists' },
  { scenario: 'ADD: add_animation_track', toolName: 'manage_widget_authoring', arguments: widgetArgs('add_animation_track', { animationName: ANIMATION_NAME, slotName: 'TitleText', trackType: 'opacity', propertyName: 'RenderOpacity' }), expected: 'success|already exists' },
  { scenario: 'ADD: add_animation_keyframe', toolName: 'manage_widget_authoring', arguments: widgetArgs('add_animation_keyframe', { animationName: ANIMATION_NAME, slotName: 'TitleText', time: 0.25, value: 0.5, interpolation: 'linear' }), expected: 'success' },
  { scenario: 'CONFIG: set_animation_loop', toolName: 'manage_widget_authoring', arguments: widgetArgs('set_animation_loop', { animationName: ANIMATION_NAME, loopCount: 1, playMode: 'forward' }), expected: 'success' },

  // === TEMPLATES ===
  { scenario: 'CREATE: create_main_menu', toolName: 'manage_widget_authoring', arguments: widgetArgs('create_main_menu', { title: 'Main Menu' }), expected: 'success' },
  { scenario: 'CREATE: create_pause_menu', toolName: 'manage_widget_authoring', arguments: widgetArgs('create_pause_menu'), expected: 'success' },
  { scenario: 'CREATE: create_settings_menu', toolName: 'manage_widget_authoring', arguments: createTemplateArgs('create_settings_menu', 'WBP_SettingsMenu', { settingsType: 'all' }), expected: 'success|already exists' },
  { scenario: 'CREATE: create_loading_screen', toolName: 'manage_widget_authoring', arguments: createTemplateArgs('create_loading_screen', 'WBP_LoadingScreen', { includeProgressBar: true }), expected: 'success|already exists' },
  { scenario: 'CREATE: create_hud_widget', toolName: 'manage_widget_authoring', arguments: widgetArgs('create_hud_widget'), expected: 'success' },
  ...hudElementCases,
  { scenario: 'CREATE: create_inventory_ui', toolName: 'manage_widget_authoring', arguments: createTemplateArgs('create_inventory_ui', 'WBP_InventoryUI', { gridSize: { columns: 6, rows: 4 } }), expected: 'success|already exists' },
  { scenario: 'CREATE: create_dialog_widget', toolName: 'manage_widget_authoring', arguments: createTemplateArgs('create_dialog_widget', 'WBP_DialogWidget', { showSpeakerName: true }), expected: 'success|already exists' },
  { scenario: 'CREATE: create_radial_menu', toolName: 'manage_widget_authoring', arguments: createTemplateArgs('create_radial_menu', 'WBP_RadialMenu', { segmentCount: 8 }), expected: 'success|already exists' },

  // === INFO ===
  { scenario: 'INFO: get_widget_info', toolName: 'manage_widget_authoring', arguments: widgetArgs('get_widget_info'), expected: 'success' },
  { scenario: 'ACTION: preview_widget', toolName: 'manage_widget_authoring', arguments: widgetArgs('preview_widget', { previewSize: '720p' }), expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-widget-authoring', testCases);
