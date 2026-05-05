#!/usr/bin/env node
/**
 * manage_sessions Tool Integration Tests
 * Exercises all session/local-multiplayer/LAN/voice actions against the live bridge.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/GameplayAssets';
const ts = Date.now();

const SESSION_NAME = `MCP_LiveSession_${ts}`;
const SERVER_NAME = `MCP_LAN_${ts}`;
const VOICE_CHANNEL = `MCP_Voice_${ts}`;
const PLAYER_NAME = `MCP_Player_${ts}`;
const MAP_PATH = '/Game/MCPTest/MainLevel';
const SERVER_PORT = 7788;
const SERVER_PASSWORD = 'mcp-test-password';
const JOIN_OPTIONS = '?Name=MCPClient';
const HOST_OPTIONS = '?MCPTest=1';
const HOST_TRAVEL_URL = `${MAP_PATH}?listen?bIsLanMatch=1?MaxPlayers=4${HOST_OPTIONS}`;
const JOIN_CONNECTION_URL = `127.0.0.1:${SERVER_PORT}${JOIN_OPTIONS}?Password=${SERVER_PASSWORD}`;

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },

  // === SESSION CONFIGURATION ===
  {
    scenario: 'CONFIG: configure_local_session_settings',
    toolName: 'manage_sessions',
    arguments: {
      action: 'configure_local_session_settings',
      sessionName: SESSION_NAME,
      maxPlayers: 4,
      bIsLANMatch: true,
      bAllowJoinInProgress: false,
      bAllowInvites: true,
      bUsesPresence: false,
      bUseLobbiesIfAvailable: false,
      bShouldAdvertise: true
    },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.sessionName', equals: SESSION_NAME, label: 'session name applied' },
      { path: 'structuredContent.result.maxPlayers', equals: 4, label: 'session max players applied' },
      { path: 'structuredContent.result.bIsLANMatch', equals: true, label: 'LAN match flag applied' },
      { path: 'structuredContent.result.bAllowJoinInProgress', equals: false, label: 'join-in-progress flag applied' }
    ]
  },
  {
    scenario: 'CONFIG: configure_session_interface',
    toolName: 'manage_sessions',
    arguments: { action: 'configure_session_interface', interfaceType: 'Null' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.interfaceType', equals: 'Null', label: 'session interface type applied' },
      { path: 'structuredContent.result.status', equals: 'configured', label: 'session interface configured status returned' }
    ]
  },

  // === SPLIT-SCREEN CONFIGURATION ===
  {
    scenario: 'CONFIG: configure_split_screen',
    toolName: 'manage_sessions',
    arguments: { action: 'configure_split_screen', enabled: true, splitScreenType: 'TwoPlayer_Vertical' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.enabled', equals: true, label: 'split-screen enabled flag applied' },
      { path: 'structuredContent.result.splitScreenType', equals: 'TwoPlayer_Vertical', label: 'split-screen type applied' },
      { path: 'structuredContent.result.verticalSplit', equals: true, label: 'vertical split detected' },
      { path: 'structuredContent.result.success', equals: true, label: 'split-screen native configuration succeeded' }
    ]
  },
  {
    scenario: 'CONFIG: set_split_screen_type',
    toolName: 'manage_sessions',
    arguments: { action: 'set_split_screen_type', splitScreenType: 'FourPlayer_Grid' },
    expected: 'success',
    assertions: [{ path: 'structuredContent.result.splitScreenType', equals: 'FourPlayer_Grid', label: 'split-screen layout returned' }]
  },

  // === PIE-ONLY LOCAL MULTIPLAYER ===
  { scenario: 'PLAYBACK: start PIE for local players', toolName: 'control_editor', arguments: { action: 'play' }, expected: 'success' },
  {
    scenario: 'INFO: get_sessions_info before adding local player',
    toolName: 'manage_sessions',
    arguments: { action: 'get_sessions_info' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.sessionsInfo.inPlaySession', equals: true, label: 'PIE session active before local-player mutation' },
      { path: 'structuredContent.result.sessionsInfo.localPlayerCount', equals: 1, label: 'primary local player present before add' }
    ]
  },
  {
    scenario: 'ADD: add_local_player',
    toolName: 'manage_sessions',
    arguments: { action: 'add_local_player', controllerId: 1 },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.playerIndex', equals: 1, label: 'secondary local player index returned' },
      { path: 'structuredContent.result.controllerId', equals: 1, label: 'secondary local player controller returned' },
      { path: 'structuredContent.result.totalLocalPlayers', equals: 2, label: 'local player count incremented' }
    ]
  },
  {
    scenario: 'INFO: get_sessions_info after adding local player',
    toolName: 'manage_sessions',
    arguments: { action: 'get_sessions_info' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.sessionsInfo.localPlayerCount', equals: 2, label: 'local player count read back after add' },
      { path: 'structuredContent.result.sessionsInfo.currentPlayers', equals: 2, label: 'current player count read back after add' },
      { path: 'structuredContent.result.sessionsInfo.splitScreenEnabled', equals: true, label: 'split-screen active with two local players' }
    ]
  },
  {
    scenario: 'DELETE: remove_local_player',
    toolName: 'manage_sessions',
    arguments: { action: 'remove_local_player', playerIndex: 1 },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.removedPlayerIndex', equals: 1, label: 'secondary local player removed' },
      { path: 'structuredContent.result.remainingPlayers', equals: 1, label: 'local player count decremented' }
    ]
  },
  {
    scenario: 'INFO: get_sessions_info after removing local player',
    toolName: 'manage_sessions',
    arguments: { action: 'get_sessions_info' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.sessionsInfo.localPlayerCount', equals: 1, label: 'local player count read back after remove' },
      { path: 'structuredContent.result.sessionsInfo.currentPlayers', equals: 1, label: 'current player count read back after remove' },
      { path: 'structuredContent.result.sessionsInfo.splitScreenEnabled', equals: false, label: 'split-screen inactive after removing secondary player' }
    ]
  },

  // === LAN CONFIGURATION ===
  {
    scenario: 'CONFIG: configure_lan_play',
    toolName: 'manage_sessions',
    arguments: { action: 'configure_lan_play', enabled: true, serverPort: SERVER_PORT, serverPassword: SERVER_PASSWORD },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.enabled', equals: true, label: 'LAN play enabled flag applied' },
      { path: 'structuredContent.result.serverPort', equals: SERVER_PORT, label: 'LAN server port applied' },
      { path: 'structuredContent.result.hasPassword', equals: true, label: 'LAN password presence returned' }
    ]
  },
  {
    scenario: 'ACTION: host_lan_server',
    toolName: 'manage_sessions',
    arguments: { action: 'host_lan_server', serverName: SERVER_NAME, mapName: MAP_PATH, maxPlayers: 4, travelOptions: HOST_OPTIONS, executeTravel: false },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.serverName', equals: SERVER_NAME, label: 'LAN server name returned' },
      { path: 'structuredContent.result.mapPath', equals: MAP_PATH, label: 'LAN host map path returned' },
      { path: 'structuredContent.result.travelURL', equals: HOST_TRAVEL_URL, label: 'LAN host travel URL constructed' },
      { path: 'structuredContent.result.travelExecuted', equals: false, label: 'LAN host test avoids disruptive travel' }
    ]
  },
  {
    scenario: 'ACTION: join_lan_server',
    toolName: 'manage_sessions',
    arguments: { action: 'join_lan_server', serverAddress: '127.0.0.1', serverPort: SERVER_PORT, serverPassword: SERVER_PASSWORD, travelOptions: JOIN_OPTIONS },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.serverAddress', equals: `127.0.0.1:${SERVER_PORT}`, label: 'LAN join address normalized with port' },
      { path: 'structuredContent.result.connectionURL', equals: JOIN_CONNECTION_URL, label: 'LAN join connection URL constructed' },
      { path: 'structuredContent.result.status', equals: 'configured', label: 'LAN join configured status returned' }
    ]
  },

  // === VOICE CHAT CONFIGURATION ===
  {
    scenario: 'TOGGLE: enable_voice_chat disabled state',
    toolName: 'manage_sessions',
    arguments: { action: 'enable_voice_chat', voiceEnabled: false },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.voiceEnabled', equals: false, label: 'voice chat disabled flag applied' },
      { path: 'structuredContent.result.success', equals: true, label: 'voice chat disable path completed' }
    ]
  },
  {
    scenario: 'CONFIG: configure_voice_settings',
    toolName: 'manage_sessions',
    arguments: {
      action: 'configure_voice_settings',
      voiceSettings: {
        volume: 0.42,
        noiseGateThreshold: 0.03,
        noiseSuppression: false,
        echoCancellation: true,
        sampleRate: 24000
      }
    },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.voiceSettings.volume', equals: 0.42, label: 'voice volume applied' },
      { path: 'structuredContent.result.voiceSettings.noiseGateThreshold', equals: 0.03, label: 'voice noise gate applied' },
      { path: 'structuredContent.result.voiceSettings.noiseSuppression', equals: false, label: 'voice noise suppression applied' },
      { path: 'structuredContent.result.voiceSettings.echoCancellation', equals: true, label: 'voice echo cancellation applied' },
      { path: 'structuredContent.result.voiceSettings.sampleRate', equals: 24000, label: 'voice sample rate applied' }
    ]
  },
  {
    scenario: 'CONFIG: set_voice_channel',
    toolName: 'manage_sessions',
    arguments: { action: 'set_voice_channel', channelName: VOICE_CHANNEL, channelType: 'Party' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.channelName', equals: VOICE_CHANNEL, label: 'voice channel name returned' },
      { path: 'structuredContent.result.channelType', equals: 'Party', label: 'voice channel type returned' }
    ]
  },
  {
    scenario: 'ACTION: mute_player',
    toolName: 'manage_sessions',
    arguments: { action: 'mute_player', playerName: PLAYER_NAME, muted: true, localPlayerNum: 0, systemWide: false },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.target', equals: PLAYER_NAME, label: 'mute player target returned' },
      { path: 'structuredContent.result.muted', equals: true, label: 'mute state returned' },
      { path: 'structuredContent.result.success', equals: true, label: 'mute request completed' }
    ]
  },
  {
    scenario: 'CONFIG: set_voice_attenuation',
    toolName: 'manage_sessions',
    arguments: { action: 'set_voice_attenuation', attenuationRadius: 1800, attenuationFalloff: 2.5 },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.attenuationRadius', equals: 1800, label: 'voice attenuation radius returned' },
      { path: 'structuredContent.result.attenuationFalloff', equals: 2.5, label: 'voice attenuation falloff returned' }
    ]
  },
  {
    scenario: 'CONFIG: configure_push_to_talk',
    toolName: 'manage_sessions',
    arguments: { action: 'configure_push_to_talk', pushToTalkEnabled: true, pushToTalkKey: 'LeftShift' },
    expected: 'success',
    assertions: [
      { path: 'structuredContent.result.pushToTalkEnabled', equals: true, label: 'push-to-talk enabled flag returned' },
      { path: 'structuredContent.result.pushToTalkKey', equals: 'LeftShift', label: 'push-to-talk key returned' }
    ]
  },

  // === CLEANUP ===
  { scenario: 'PLAYBACK: stop PIE after session tests', toolName: 'control_editor', arguments: { action: 'stop_pie' }, expected: 'success' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-sessions', testCases);
