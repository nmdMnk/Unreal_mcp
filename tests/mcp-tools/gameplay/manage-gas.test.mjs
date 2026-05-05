#!/usr/bin/env node
/**
 * manage_gas Tool Integration Tests
 * Covers all 27 actions with real captured asset paths.
 */

import { runToolTests } from '../../test-runner.mjs';

const ts = Date.now();
const TEST_FOLDER = `/Game/MCPTest/GameplayAssets/ManageGAS_${ts}`;
const blueprintName = `BP_TestGAS_${ts}`;
const attributeSetName = `BP_TestAttributes_${ts}`;
const abilityName = `BP_TestAbility_${ts}`;
const effectName = `BP_TestEffect_${ts}`;
const cueName = `BP_TestCue_${ts}`;
const attributeName = `Health_${ts}`;
const abilityTag = `Ability.Test.${ts}`;
const effectTag = `Effect.Test.${ts}`;
const cueTag = `GameplayCue.Test.${ts}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success' },
  {
    scenario: 'Setup: create test blueprint',
    toolName: 'manage_blueprint',
    arguments: { action: 'create', name: blueprintName, path: TEST_FOLDER, parentClass: 'Actor' },
    expected: 'success',
    captureResult: { key: 'blueprintPath', fromField: 'result.assetPath' }
  },

  // === COMPONENTS / ATTRIBUTES ===
  { scenario: 'ADD: add_ability_system_component', toolName: 'manage_gas', arguments: { action: 'add_ability_system_component', blueprintPath: '${captured:blueprintPath}', componentName: 'AbilitySystemComponent' }, expected: 'success' },
  { scenario: 'CONFIG: configure_asc', toolName: 'manage_gas', arguments: { action: 'configure_asc', blueprintPath: '${captured:blueprintPath}', componentName: 'AbilitySystemComponent', replicationMode: 'full' }, expected: 'success' },
  {
    scenario: 'CREATE: create_attribute_set',
    toolName: 'manage_gas',
    arguments: { action: 'create_attribute_set', name: attributeSetName, path: TEST_FOLDER },
    expected: 'success',
    captureResult: { key: 'attributeSetPath', fromField: 'result.assetPath' }
  },
  { scenario: 'ADD: add_attribute', toolName: 'manage_gas', arguments: { action: 'add_attribute', attributeSetPath: '${captured:attributeSetPath}', attributeName, attributeType: 'Custom', defaultValue: 100 }, expected: 'success' },
  { scenario: 'CONFIG: set_attribute_base_value', toolName: 'manage_gas', arguments: { action: 'set_attribute_base_value', attributeSetPath: '${captured:attributeSetPath}', attributeName, baseValue: 125 }, expected: 'success' },
  { scenario: 'CONFIG: set_attribute_clamping', toolName: 'manage_gas', arguments: { action: 'set_attribute_clamping', attributeSetPath: '${captured:attributeSetPath}', attributeName, minValue: 0, maxValue: 200, clampMode: 'MinMax' }, expected: 'success' },

  // === GAMEPLAY ABILITY ===
  {
    scenario: 'CREATE: create_gameplay_ability',
    toolName: 'manage_gas',
    arguments: { action: 'create_gameplay_ability', name: abilityName, path: TEST_FOLDER },
    expected: 'success',
    captureResult: { key: 'abilityPath', fromField: 'result.assetPath' }
  },
  { scenario: 'CONFIG: set_ability_tags', toolName: 'manage_gas', arguments: { action: 'set_ability_tags', abilityPath: '${captured:abilityPath}', abilityTags: [abilityTag] }, expected: 'success' },
  { scenario: 'CONFIG: set_ability_costs', toolName: 'manage_gas', arguments: { action: 'set_ability_costs', abilityPath: '${captured:abilityPath}' }, expected: 'success' },
  { scenario: 'CONFIG: set_ability_cooldown', toolName: 'manage_gas', arguments: { action: 'set_ability_cooldown', abilityPath: '${captured:abilityPath}' }, expected: 'success' },
  { scenario: 'CONFIG: set_ability_targeting', toolName: 'manage_gas', arguments: { action: 'set_ability_targeting', abilityPath: '${captured:abilityPath}', targetingType: 'single_target', targetingRange: 1200, requiresLineOfSight: true, targetingAngle: 90 }, expected: 'success' },
  { scenario: 'ADD: add_ability_task', toolName: 'manage_gas', arguments: { action: 'add_ability_task', abilityPath: '${captured:abilityPath}', taskType: 'WaitDelay' }, expected: 'success' },
  { scenario: 'CONFIG: set_activation_policy', toolName: 'manage_gas', arguments: { action: 'set_activation_policy', abilityPath: '${captured:abilityPath}', policy: 'local_predicted' }, expected: 'success' },
  { scenario: 'CONFIG: set_instancing_policy', toolName: 'manage_gas', arguments: { action: 'set_instancing_policy', abilityPath: '${captured:abilityPath}', policy: 'instanced_per_actor' }, expected: 'success' },

  // === GAMEPLAY EFFECT ===
  {
    scenario: 'CREATE: create_gameplay_effect',
    toolName: 'manage_gas',
    arguments: { action: 'create_gameplay_effect', name: effectName, path: TEST_FOLDER, durationType: 'instant' },
    expected: 'success',
    captureResult: { key: 'effectPath', fromField: 'result.assetPath' }
  },
  { scenario: 'CONFIG: set_effect_duration', toolName: 'manage_gas', arguments: { action: 'set_effect_duration', effectPath: '${captured:effectPath}', durationType: 'has_duration', duration: 5 }, expected: 'success' },
  { scenario: 'ADD: add_effect_modifier', toolName: 'manage_gas', arguments: { action: 'add_effect_modifier', effectPath: '${captured:effectPath}', attributeName, operation: 'additive', magnitude: 25 }, expected: 'success' },
  { scenario: 'CONFIG: set_modifier_magnitude', toolName: 'manage_gas', arguments: { action: 'set_modifier_magnitude', effectPath: '${captured:effectPath}', modifierIndex: 0, magnitudeType: 'scalable_float', value: 50 }, expected: 'success' },
  { scenario: 'ADD: add_effect_execution_calculation', toolName: 'manage_gas', arguments: { action: 'add_effect_execution_calculation', effectPath: '${captured:effectPath}', calculationClass: '/Script/GameplayAbilities.GameplayEffectExecutionCalculation' }, expected: 'success' },
  { scenario: 'ADD: add_effect_cue', toolName: 'manage_gas', arguments: { action: 'add_effect_cue', effectPath: '${captured:effectPath}', cueTag }, expected: 'success' },
  { scenario: 'CONFIG: set_effect_stacking', toolName: 'manage_gas', arguments: { action: 'set_effect_stacking', effectPath: '${captured:effectPath}', stackingType: 'aggregate_by_target', stackLimit: 3 }, expected: 'success' },
  { scenario: 'CONFIG: set_effect_tags', toolName: 'manage_gas', arguments: { action: 'set_effect_tags', effectPath: '${captured:effectPath}', grantedTags: [effectTag] }, expected: 'success' },

  // === GAMEPLAY CUES / UTILITY ===
  {
    scenario: 'CREATE: create_gameplay_cue_notify',
    toolName: 'manage_gas',
    arguments: { action: 'create_gameplay_cue_notify', name: cueName, path: TEST_FOLDER, cueType: 'Static', cueTag },
    expected: 'success',
    captureResult: { key: 'cuePath', fromField: 'result.assetPath' }
  },
  { scenario: 'CONFIG: configure_cue_trigger', toolName: 'manage_gas', arguments: { action: 'configure_cue_trigger', cuePath: '${captured:cuePath}', triggerType: 'on_execute' }, expected: 'success' },
  { scenario: 'CONFIG: set_cue_effects', toolName: 'manage_gas', arguments: { action: 'set_cue_effects', cuePath: '${captured:cuePath}', particleSystem: '/Engine/EngineResources/DefaultTexture', sound: '/Engine/EngineSounds/Notifications/CompileSuccess_Cue' }, expected: 'success' },
  { scenario: 'ADD: add_tag_to_asset', toolName: 'manage_gas', arguments: { action: 'add_tag_to_asset', assetPath: '${captured:abilityPath}', tagName: abilityTag }, expected: 'success' },
  { scenario: 'INFO: get_gas_info', toolName: 'manage_gas', arguments: { action: 'get_gas_info', assetPath: '${captured:abilityPath}' }, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' }
];

runToolTests('manage-gas', testCases);
