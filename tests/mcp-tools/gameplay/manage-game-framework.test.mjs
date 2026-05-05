#!/usr/bin/env node
/**
 * manage_game_framework Tool Integration Tests
 * Covers all 20 actions with live Blueprint mutations and readbacks.
 */

import { runToolTests } from '../../test-runner.mjs';

const ts = Date.now();
const TEST_FOLDER = `/Game/MCPTest/GameplayFramework_${ts}`;

const GAME_MODE_NAME = `BP_FrameworkGameMode_${ts}`;
const GAME_STATE_NAME = `BP_FrameworkGameState_${ts}`;
const PLAYER_CONTROLLER_NAME = `BP_FrameworkPlayerController_${ts}`;
const PLAYER_STATE_NAME = `BP_FrameworkPlayerState_${ts}`;
const GAME_INSTANCE_NAME = `BP_FrameworkGameInstance_${ts}`;
const HUD_NAME = `BP_FrameworkHUD_${ts}`;

const GAME_MODE_ASSET_PATH = `${TEST_FOLDER}/${GAME_MODE_NAME}`;
const GAME_MODE_OBJECT_PATH = `${GAME_MODE_ASSET_PATH}.${GAME_MODE_NAME}`;
const GAME_STATE_ASSET_PATH = `${TEST_FOLDER}/${GAME_STATE_NAME}`;
const GAME_STATE_OBJECT_PATH = `${GAME_STATE_ASSET_PATH}.${GAME_STATE_NAME}`;
const PLAYER_CONTROLLER_ASSET_PATH = `${TEST_FOLDER}/${PLAYER_CONTROLLER_NAME}`;
const PLAYER_CONTROLLER_OBJECT_PATH = `${PLAYER_CONTROLLER_ASSET_PATH}.${PLAYER_CONTROLLER_NAME}`;
const PLAYER_STATE_ASSET_PATH = `${TEST_FOLDER}/${PLAYER_STATE_NAME}`;
const PLAYER_STATE_OBJECT_PATH = `${PLAYER_STATE_ASSET_PATH}.${PLAYER_STATE_NAME}`;
const GAME_INSTANCE_ASSET_PATH = `${TEST_FOLDER}/${GAME_INSTANCE_NAME}`;
const GAME_INSTANCE_OBJECT_PATH = `${GAME_INSTANCE_ASSET_PATH}.${GAME_INSTANCE_NAME}`;
const HUD_ASSET_PATH = `${TEST_FOLDER}/${HUD_NAME}`;
const HUD_OBJECT_PATH = `${HUD_ASSET_PATH}.${HUD_NAME}`;

const DEFAULT_PAWN_CLASS = '/Script/Engine.DefaultPawn';
const PLAYER_CONTROLLER_CLASS = '/Script/Engine.PlayerController';
const GAME_STATE_CLASS = '/Script/Engine.GameState';
const PLAYER_STATE_CLASS = '/Script/Engine.PlayerState';
const SPECTATOR_CLASS = '/Script/Engine.SpectatorPawn';

const createBlueprintAssertions = (assetPath, objectPath, assetName, label) => [
  { path: 'structuredContent.result.success', equals: true, label: `${label} native success flag` },
  { path: 'structuredContent.result.blueprintPath', equals: objectPath, label: `${label} object path returned` },
  { path: 'structuredContent.result.assetPath', equals: assetPath, label: `${label} package path verified` },
  { path: 'structuredContent.result.assetName', equals: assetName, label: `${label} asset name verified` },
  { path: 'structuredContent.result.existsAfter', equals: true, label: `${label} exists after creation` },
  { path: 'structuredContent.result.assetClass', equals: 'Blueprint', label: `${label} asset class verified` }
];

const gameModePathAssertion = (label) => [
  { path: 'structuredContent.result.success', equals: true, label: `${label} native success flag` },
  { path: 'structuredContent.result.blueprintPath', equals: GAME_MODE_OBJECT_PATH, label: `${label} target game mode returned` }
];

const testCases = [
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },

  { scenario: 'CREATE: create_game_mode', toolName: 'manage_game_framework', arguments: { action: 'create_game_mode', name: GAME_MODE_NAME, path: TEST_FOLDER, parentClass: '/Script/Engine.GameMode' }, expected: 'success', assertions: createBlueprintAssertions(GAME_MODE_ASSET_PATH, GAME_MODE_OBJECT_PATH, GAME_MODE_NAME, 'game mode blueprint') },
  { scenario: 'CREATE: create_game_state', toolName: 'manage_game_framework', arguments: { action: 'create_game_state', name: GAME_STATE_NAME, path: TEST_FOLDER, parentClass: '/Script/Engine.GameState' }, expected: 'success', assertions: createBlueprintAssertions(GAME_STATE_ASSET_PATH, GAME_STATE_OBJECT_PATH, GAME_STATE_NAME, 'game state blueprint') },
  { scenario: 'CREATE: create_player_controller', toolName: 'manage_game_framework', arguments: { action: 'create_player_controller', name: PLAYER_CONTROLLER_NAME, path: TEST_FOLDER, parentClass: '/Script/Engine.PlayerController' }, expected: 'success', assertions: createBlueprintAssertions(PLAYER_CONTROLLER_ASSET_PATH, PLAYER_CONTROLLER_OBJECT_PATH, PLAYER_CONTROLLER_NAME, 'player controller blueprint') },
  { scenario: 'CREATE: create_player_state', toolName: 'manage_game_framework', arguments: { action: 'create_player_state', name: PLAYER_STATE_NAME, path: TEST_FOLDER, parentClass: '/Script/Engine.PlayerState' }, expected: 'success', assertions: createBlueprintAssertions(PLAYER_STATE_ASSET_PATH, PLAYER_STATE_OBJECT_PATH, PLAYER_STATE_NAME, 'player state blueprint') },
  { scenario: 'CREATE: create_game_instance', toolName: 'manage_game_framework', arguments: { action: 'create_game_instance', name: GAME_INSTANCE_NAME, path: TEST_FOLDER, parentClass: '/Script/Engine.GameInstance' }, expected: 'success', assertions: createBlueprintAssertions(GAME_INSTANCE_ASSET_PATH, GAME_INSTANCE_OBJECT_PATH, GAME_INSTANCE_NAME, 'game instance blueprint') },
  { scenario: 'CREATE: create_hud_class', toolName: 'manage_game_framework', arguments: { action: 'create_hud_class', name: HUD_NAME, path: TEST_FOLDER, parentClass: '/Script/Engine.HUD' }, expected: 'success', assertions: createBlueprintAssertions(HUD_ASSET_PATH, HUD_OBJECT_PATH, HUD_NAME, 'hud blueprint') },

  { scenario: 'CONFIG: set_default_pawn_class', toolName: 'manage_game_framework', arguments: { action: 'set_default_pawn_class', gameModeBlueprint: GAME_MODE_OBJECT_PATH, pawnClass: DEFAULT_PAWN_CLASS }, expected: 'success', assertions: gameModePathAssertion('default pawn class') },
  { scenario: 'INFO: read back default pawn class', toolName: 'manage_game_framework', arguments: { action: 'get_game_framework_info', gameModeBlueprint: GAME_MODE_OBJECT_PATH }, expected: 'success', assertions: [{ path: 'structuredContent.result.gameFrameworkInfo.defaultPawnClass', equals: DEFAULT_PAWN_CLASS, label: 'default pawn class read back from CDO' }] },
  { scenario: 'CONFIG: set_player_controller_class', toolName: 'manage_game_framework', arguments: { action: 'set_player_controller_class', gameModeBlueprint: GAME_MODE_OBJECT_PATH, playerControllerClass: PLAYER_CONTROLLER_CLASS }, expected: 'success', assertions: gameModePathAssertion('player controller class') },
  { scenario: 'INFO: read back player controller class', toolName: 'manage_game_framework', arguments: { action: 'get_game_framework_info', gameModeBlueprint: GAME_MODE_OBJECT_PATH }, expected: 'success', assertions: [{ path: 'structuredContent.result.gameFrameworkInfo.playerControllerClass', equals: PLAYER_CONTROLLER_CLASS, label: 'player controller class read back from CDO' }] },
  { scenario: 'CONFIG: set_game_state_class', toolName: 'manage_game_framework', arguments: { action: 'set_game_state_class', gameModeBlueprint: GAME_MODE_OBJECT_PATH, gameStateClass: GAME_STATE_CLASS }, expected: 'success', assertions: gameModePathAssertion('game state class') },
  { scenario: 'INFO: read back game state class', toolName: 'manage_game_framework', arguments: { action: 'get_game_framework_info', gameModeBlueprint: GAME_MODE_OBJECT_PATH }, expected: 'success', assertions: [{ path: 'structuredContent.result.gameFrameworkInfo.gameStateClass', equals: GAME_STATE_CLASS, label: 'game state class read back from CDO' }] },
  { scenario: 'CONFIG: set_player_state_class', toolName: 'manage_game_framework', arguments: { action: 'set_player_state_class', gameModeBlueprint: GAME_MODE_OBJECT_PATH, playerStateClass: PLAYER_STATE_CLASS }, expected: 'success', assertions: gameModePathAssertion('player state class') },
  { scenario: 'INFO: read back player state class', toolName: 'manage_game_framework', arguments: { action: 'get_game_framework_info', gameModeBlueprint: GAME_MODE_OBJECT_PATH }, expected: 'success', assertions: [{ path: 'structuredContent.result.gameFrameworkInfo.playerStateClass', equals: PLAYER_STATE_CLASS, label: 'player state class read back from CDO' }] },
  { scenario: 'CONFIG: configure_game_rules', toolName: 'manage_game_framework', arguments: { action: 'configure_game_rules', gameModeBlueprint: GAME_MODE_OBJECT_PATH, bDelayedStart: true }, expected: 'success', assertions: gameModePathAssertion('game rules') },

  { scenario: 'ACTION: setup_match_states', toolName: 'manage_game_framework', arguments: { action: 'setup_match_states', gameModeBlueprint: GAME_MODE_OBJECT_PATH, states: ['Waiting', 'Warmup', 'InProgress', 'PostMatch'] }, expected: 'success', assertions: [...gameModePathAssertion('match states'), { path: 'structuredContent.result.variablesAdded', equals: 6, label: 'match flow variables added' }, { path: 'structuredContent.result.stateCount', equals: 4, label: 'match state count returned' }, { path: 'structuredContent.result.configuredStates', length: 4, label: 'configured match states returned' }] },
  { scenario: 'CONFIG: configure_round_system', toolName: 'manage_game_framework', arguments: { action: 'configure_round_system', gameModeBlueprint: GAME_MODE_OBJECT_PATH, numRounds: 3, roundTime: 180, intermissionTime: 15 }, expected: 'success', assertions: [...gameModePathAssertion('round system'), { path: 'structuredContent.result.variablesAdded', equals: 7, label: 'round system variables added' }, { path: 'structuredContent.result.configuration.numRounds', equals: 3, label: 'round count configured' }, { path: 'structuredContent.result.configuration.roundTime', equals: 180, label: 'round time configured' }, { path: 'structuredContent.result.configuration.intermissionTime', equals: 15, label: 'intermission time configured' }] },
  { scenario: 'CONFIG: configure_team_system', toolName: 'manage_game_framework', arguments: { action: 'configure_team_system', gameModeBlueprint: GAME_MODE_OBJECT_PATH, numTeams: 4, teamSize: 5, autoBalance: false, friendlyFire: true }, expected: 'success', assertions: [...gameModePathAssertion('team system'), { path: 'structuredContent.result.variablesAdded', equals: 6, label: 'team system variables added' }, { path: 'structuredContent.result.configuration.numTeams', equals: 4, label: 'team count configured' }, { path: 'structuredContent.result.configuration.teamSize', equals: 5, label: 'team size configured' }, { path: 'structuredContent.result.configuration.autoBalance', equals: false, label: 'auto balance configured' }, { path: 'structuredContent.result.configuration.friendlyFire', equals: true, label: 'friendly fire configured' }] },
  { scenario: 'CONFIG: configure_scoring_system', toolName: 'manage_game_framework', arguments: { action: 'configure_scoring_system', gameModeBlueprint: GAME_MODE_OBJECT_PATH, scorePerKill: 125, scorePerAssist: 25, scorePerObjective: 750, winScore: 1500, scorePerDeath: -10 }, expected: 'success', assertions: [...gameModePathAssertion('scoring system'), { path: 'structuredContent.result.variablesAdded', equals: 5, label: 'scoring system variables added' }, { path: 'structuredContent.result.configuration.scorePerKill', equals: 125, label: 'kill score configured' }, { path: 'structuredContent.result.configuration.scorePerAssist', equals: 25, label: 'assist score configured' }, { path: 'structuredContent.result.configuration.scorePerObjective', equals: 750, label: 'objective score configured' }, { path: 'structuredContent.result.configuration.winScore', equals: 1500, label: 'win score configured' }, { path: 'structuredContent.result.configuration.scorePerDeath', equals: -10, label: 'death score configured' }] },
  { scenario: 'CONFIG: configure_spawn_system', toolName: 'manage_game_framework', arguments: { action: 'configure_spawn_system', gameModeBlueprint: GAME_MODE_OBJECT_PATH, spawnSelectionMethod: 'TeamWeighted', respawnDelay: 6.5, usePlayerStarts: true, canRespawn: false, maxRespawns: 2 }, expected: 'success', assertions: [...gameModePathAssertion('spawn system'), { path: 'structuredContent.result.variablesAdded', equals: 5, label: 'spawn system variables added' }, { path: 'structuredContent.result.configuration.spawnSelectionMethod', equals: 'TeamWeighted', label: 'spawn selection configured' }, { path: 'structuredContent.result.configuration.respawnDelay', equals: 6.5, label: 'spawn respawn delay configured' }, { path: 'structuredContent.result.configuration.usePlayerStarts', equals: true, label: 'player starts enabled' }, { path: 'structuredContent.result.configuration.canRespawn', equals: false, label: 'can respawn configured' }, { path: 'structuredContent.result.configuration.maxRespawns', equals: 2, label: 'max respawns configured' }] },

  { scenario: 'CONFIG: configure_player_start', toolName: 'manage_game_framework', arguments: { action: 'configure_player_start', blueprintPath: GAME_MODE_OBJECT_PATH, teamIndex: 2 }, expected: 'success', assertions: [{ path: 'structuredContent.result.success', equals: true, label: 'player start native success flag' }, { path: 'structuredContent.result.teamIndex', equals: 2, label: 'player start team index returned' }, { path: 'structuredContent.result.playerStartTag', equals: 'Team2', label: 'player start team tag generated' }] },
  { scenario: 'CONFIG: set_respawn_rules', toolName: 'manage_game_framework', arguments: { action: 'set_respawn_rules', gameModeBlueprint: GAME_MODE_OBJECT_PATH, respawnDelay: 9.25, respawnLocation: 'TeamStart', forceRespawn: false, respawnLives: 3 }, expected: 'success', assertions: [...gameModePathAssertion('respawn rules'), { path: 'structuredContent.result.variablesAdded', equals: 3, label: 'respawn variables added' }, { path: 'structuredContent.result.configuration.respawnDelay', equals: 9.25, label: 'respawn delay configured' }, { path: 'structuredContent.result.configuration.respawnLocation', equals: 'TeamStart', label: 'respawn location configured' }, { path: 'structuredContent.result.configuration.forceRespawn', equals: false, label: 'force respawn configured' }, { path: 'structuredContent.result.configuration.respawnLives', equals: 3, label: 'respawn lives configured' }] },
  { scenario: 'CONFIG: configure_spectating', toolName: 'manage_game_framework', arguments: { action: 'configure_spectating', gameModeBlueprint: GAME_MODE_OBJECT_PATH, spectatorClass: SPECTATOR_CLASS, allowSpectating: true, spectatorViewMode: 'FreeCam' }, expected: 'success', assertions: gameModePathAssertion('spectating') },

  { scenario: 'INFO: get_game_framework_info final readback', toolName: 'manage_game_framework', arguments: { action: 'get_game_framework_info', gameModeBlueprint: GAME_MODE_OBJECT_PATH }, expected: 'success', assertions: [{ path: 'structuredContent.result.success', equals: true, label: 'game framework info native success flag' }, { path: 'structuredContent.result.gameFrameworkInfo.gameModeClass', equals: `${GAME_MODE_OBJECT_PATH}_C`, label: 'game mode generated class read back' }, { path: 'structuredContent.result.gameFrameworkInfo.defaultPawnClass', equals: DEFAULT_PAWN_CLASS, label: 'final default pawn readback' }, { path: 'structuredContent.result.gameFrameworkInfo.playerControllerClass', equals: PLAYER_CONTROLLER_CLASS, label: 'final player controller readback' }, { path: 'structuredContent.result.gameFrameworkInfo.gameStateClass', equals: GAME_STATE_CLASS, label: 'final game state readback' }, { path: 'structuredContent.result.gameFrameworkInfo.playerStateClass', equals: PLAYER_STATE_CLASS, label: 'final player state readback' }] },

  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' }
];

runToolTests('manage-game-framework', testCases);
