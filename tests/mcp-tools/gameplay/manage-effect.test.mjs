#!/usr/bin/env node
/**
 * manage_effect Tool Integration Tests
 * Covers all 58 actions with proper setup/teardown sequencing.
 */

import { runToolTests } from '../../test-runner.mjs';

const TEST_FOLDER = '/Game/MCPTest/AuthoringAssets';
const ts = Date.now();

const testCases = [
  // === SETUP ===
  { scenario: 'Setup: create test folder', toolName: 'manage_asset', arguments: { action: 'create_folder', path: TEST_FOLDER }, expected: 'success|already exists' },
  { scenario: 'Setup: spawn test actor', toolName: 'control_actor', arguments: { action: 'spawn', classPath: '/Engine/BasicShapes/Cube', actorName: `TestActor_${ts}`, location: { x: 0, y: 0, z: 100 } }, expected: 'success' },

  // === ACTION ===
  { scenario: 'ACTION: particle', toolName: 'manage_effect', arguments: {"action": "particle"}, expected: 'success' },
  { scenario: 'ACTION: niagara', toolName: 'manage_effect', arguments: {"action": "niagara"}, expected: 'success' },
  { scenario: 'ACTION: debug_shape', toolName: 'manage_effect', arguments: {"action": "debug_shape"}, expected: 'success' },
  // === CREATE ===
  { scenario: 'CREATE: spawn_niagara', toolName: 'manage_effect', arguments: {"action": "spawn_niagara", "location": {"x": 0, "y": 0, "z": 100}}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_dynamic_light', toolName: 'manage_effect', arguments: {"action": "create_dynamic_light", "name": "Testdynamic_light", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_niagara_system', toolName: 'manage_effect', arguments: {"action": "create_niagara_system", "name": "Testniagara_system", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_niagara_emitter', toolName: 'manage_effect', arguments: {"action": "create_niagara_emitter", "name": "Testniagara_emitter", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_volumetric_fog', toolName: 'manage_effect', arguments: {"action": "create_volumetric_fog", "name": "Testvolumetric_fog", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_particle_trail', toolName: 'manage_effect', arguments: {"action": "create_particle_trail", "name": "Testparticle_trail", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_environment_effect', toolName: 'manage_effect', arguments: {"action": "create_environment_effect", "name": "Testenvironment_effect", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_impact_effect', toolName: 'manage_effect', arguments: {"action": "create_impact_effect", "name": "Testimpact_effect", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  { scenario: 'CREATE: create_niagara_ribbon', toolName: 'manage_effect', arguments: {"action": "create_niagara_ribbon", "name": "Testniagara_ribbon", "path": "/Game/MCPTest"}, expected: 'success|already exists' },
  // === ACTION ===
  { scenario: 'ACTION: activate', toolName: 'manage_effect', arguments: {"action": "activate"}, expected: 'success' },
  { scenario: 'ACTION: activate_effect', toolName: 'manage_effect', arguments: {"action": "activate_effect"}, expected: 'success' },
  { scenario: 'ACTION: deactivate', toolName: 'manage_effect', arguments: {"action": "deactivate"}, expected: 'success' },
  { scenario: 'ACTION: reset', toolName: 'manage_effect', arguments: {"action": "reset"}, expected: 'success' },
  // === PLAYBACK ===
  { scenario: 'PLAYBACK: advance_simulation', toolName: 'manage_effect', arguments: {"action": "advance_simulation"}, expected: 'success' },
  // === ADD ===
  { scenario: 'ADD: add_niagara_module', toolName: 'manage_effect', arguments: {"action": "add_niagara_module", "name": "Testniagara_module"}, expected: 'success|already exists', captureResult: { key: 'niagaraModuleNodeId', fromField: 'result.nodeId' } },
  // === CONNECT ===
  { scenario: 'CONNECT: connect_niagara_pins', toolName: 'manage_effect', arguments: {"action": "connect_niagara_pins", "autoConnect": true}, expected: 'success', assertions: [{ path: 'structuredContent.result.connected', equals: true, label: 'real Niagara graph pins connected' }, { path: 'structuredContent.result.autoConnected', equals: true, label: 'native auto-connect path executed' }] },
  // === DELETE ===
  { scenario: 'DELETE: remove_niagara_node', toolName: 'manage_effect', arguments: {"action": "remove_niagara_node", "nodeId": "${captured:niagaraModuleNodeId}"}, expected: 'success', assertions: [{ path: 'structuredContent.result.removed', equals: true, label: 'captured Niagara graph node removed' }] },
  // === CONFIG ===
  { scenario: 'CONFIG: set_niagara_parameter', toolName: 'manage_effect', arguments: {"action": "set_niagara_parameter", "propertyName": "niagara_parameter", "propertyValue": 1}, expected: 'success' },
  // === DELETE ===
  { scenario: 'DELETE: clear_debug_shapes', toolName: 'manage_effect', arguments: {"action": "clear_debug_shapes"}, expected: 'success|not found' },
  // === ACTION ===
  { scenario: 'ACTION: cleanup', toolName: 'manage_effect', arguments: {"action": "cleanup"}, expected: 'success|not found' },
  // === INFO ===
  { scenario: 'INFO: list_debug_shapes', toolName: 'manage_effect', arguments: {"action": "list_debug_shapes"}, expected: 'success' },
  // === ADD ===
  { scenario: 'ADD: add_emitter_to_system', toolName: 'manage_effect', arguments: {"action": "add_emitter_to_system", "name": "Testemitter_to_system"}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_emitter_properties', toolName: 'manage_effect', arguments: {"action": "set_emitter_properties", "propertyName": "emitter_properties", "propertyValue": 1}, expected: 'success' },
  // === ADD ===
  { scenario: 'ADD: add_spawn_rate_module', toolName: 'manage_effect', arguments: {"action": "add_spawn_rate_module", "name": "Testspawn_rate_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_spawn_burst_module', toolName: 'manage_effect', arguments: {"action": "add_spawn_burst_module", "name": "Testspawn_burst_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_spawn_per_unit_module', toolName: 'manage_effect', arguments: {"action": "add_spawn_per_unit_module", "name": "Testspawn_per_unit_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_initialize_particle_module', toolName: 'manage_effect', arguments: {"action": "add_initialize_particle_module", "name": "Testinitialize_particle_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_particle_state_module', toolName: 'manage_effect', arguments: {"action": "add_particle_state_module", "name": "Testparticle_state_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_force_module', toolName: 'manage_effect', arguments: {"action": "add_force_module", "name": "Testforce_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_velocity_module', toolName: 'manage_effect', arguments: {"action": "add_velocity_module", "name": "Testvelocity_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_acceleration_module', toolName: 'manage_effect', arguments: {"action": "add_acceleration_module", "name": "Testacceleration_module"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.parameterAdded', equals: true, label: 'acceleration parameter added to Niagara system' }] },
  { scenario: 'ADD: add_size_module', toolName: 'manage_effect', arguments: {"action": "add_size_module", "name": "Testsize_module"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.parameterAdded', equals: true, label: 'size parameter added to Niagara system' }] },
  { scenario: 'ADD: add_color_module', toolName: 'manage_effect', arguments: {"action": "add_color_module", "name": "Testcolor_module"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.parameterAdded', equals: true, label: 'color parameter added to Niagara system' }] },
  { scenario: 'ADD: add_sprite_renderer_module', toolName: 'manage_effect', arguments: {"action": "add_sprite_renderer_module", "name": "Testsprite_renderer_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_mesh_renderer_module', toolName: 'manage_effect', arguments: {"action": "add_mesh_renderer_module", "name": "Testmesh_renderer_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_ribbon_renderer_module', toolName: 'manage_effect', arguments: {"action": "add_ribbon_renderer_module", "name": "Testribbon_renderer_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_light_renderer_module', toolName: 'manage_effect', arguments: {"action": "add_light_renderer_module", "name": "Testlight_renderer_module"}, expected: 'success|already exists' },
  { scenario: 'ADD: add_collision_module', toolName: 'manage_effect', arguments: {"action": "add_collision_module", "name": "Testcollision_module"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.moduleAdded', equals: true, label: 'collision module added to Niagara stack' }, { path: 'structuredContent.result.parameterAdded', equals: true, label: 'collision parameters added to Niagara system' }] },
  { scenario: 'ADD: add_kill_particles_module', toolName: 'manage_effect', arguments: {"action": "add_kill_particles_module", "name": "Testkill_particles_module"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.moduleAdded', equals: true, label: 'kill particles module added to Niagara stack' }] },
  { scenario: 'ADD: add_camera_offset_module', toolName: 'manage_effect', arguments: {"action": "add_camera_offset_module", "name": "Testcamera_offset_module"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.moduleAdded', equals: true, label: 'camera offset module added to Niagara stack' }, { path: 'structuredContent.result.parameterAdded', equals: true, label: 'camera offset parameter added to Niagara system' }] },
  { scenario: 'ADD: add_user_parameter', toolName: 'manage_effect', arguments: {"action": "add_user_parameter", "name": "Testuser_parameter"}, expected: 'success|already exists' },
  // === CONFIG ===
  { scenario: 'CONFIG: set_parameter_value', toolName: 'manage_effect', arguments: {"action": "set_parameter_value", "propertyName": "parameter_value", "propertyValue": 1}, expected: 'success' },
  // === CONNECT ===
  { scenario: 'CONNECT: bind_parameter_to_source applies real assignment binding', toolName: 'manage_effect', arguments: {"action": "bind_parameter_to_source"}, expected: 'success', assertions: [{ path: 'structuredContent.result.bindingApplied', equals: true, label: 'real Niagara parameter binding applied' }, { path: 'structuredContent.result.assignmentModuleAdded', equals: true, label: 'assignment module added to Niagara stack' }, { path: 'structuredContent.result.niagaraDefaultSource', equals: 'Emitter Age', label: 'Emitter.Age normalized to Niagara engine constant' }] },
  // === ADD ===
  { scenario: 'ADD: add_skeletal_mesh_data_interface', toolName: 'manage_effect', arguments: {"action": "add_skeletal_mesh_data_interface", "name": "Testskeletal_mesh_data_interface"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.dataInterfaceAdded', equals: true, label: 'skeletal mesh data interface added to exposed parameters' }] },
  { scenario: 'ADD: add_static_mesh_data_interface', toolName: 'manage_effect', arguments: {"action": "add_static_mesh_data_interface", "name": "Teststatic_mesh_data_interface"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.dataInterfaceAdded', equals: true, label: 'static mesh data interface added to exposed parameters' }] },
  { scenario: 'ADD: add_spline_data_interface', toolName: 'manage_effect', arguments: {"action": "add_spline_data_interface", "name": "Testspline_data_interface"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.dataInterfaceAdded', equals: true, label: 'spline data interface added to exposed parameters' }] },
  { scenario: 'ADD: add_audio_spectrum_data_interface', toolName: 'manage_effect', arguments: {"action": "add_audio_spectrum_data_interface", "name": "Testaudio_spectrum_data_interface"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.dataInterfaceAdded', equals: true, label: 'audio spectrum data interface added to exposed parameters' }] },
  { scenario: 'ADD: add_collision_query_data_interface', toolName: 'manage_effect', arguments: {"action": "add_collision_query_data_interface", "name": "Testcollision_query_data_interface"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.dataInterfaceAdded', equals: true, label: 'collision query data interface added to exposed parameters' }] },
  { scenario: 'ADD: add_event_generator', toolName: 'manage_effect', arguments: {"action": "add_event_generator", "name": "Testevent_generator"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.eventGeneratorAdded', equals: true, label: 'event generator mutation recorded' }] },
  { scenario: 'ADD: add_event_receiver', toolName: 'manage_effect', arguments: {"action": "add_event_receiver", "name": "Testevent_receiver"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.eventHandlerAdded', equals: true, label: 'event handler added to Niagara emitter' }, { path: 'structuredContent.result.eventGraphCreated', equals: true, label: 'event handler output graph created' }] },
  // === CONFIG ===
  { scenario: 'CONFIG: configure_event_payload', toolName: 'manage_effect', arguments: {"action": "configure_event_payload"}, expected: 'success', assertions: [{ path: 'structuredContent.result.eventPayloadConfigured', equals: true, label: 'event payload parameters added' }] },
  // === TOGGLE ===
  { scenario: 'TOGGLE: enable_gpu_simulation', toolName: 'manage_effect', arguments: {"action": "enable_gpu_simulation"}, expected: 'success' },
  // === ADD ===
  { scenario: 'ADD: add_simulation_stage', toolName: 'manage_effect', arguments: {"action": "add_simulation_stage", "name": "Testsimulation_stage"}, expected: 'success|already exists', assertions: [{ path: 'structuredContent.result.simulationStageAdded', equals: true, label: 'simulation stage added to Niagara emitter' }, { path: 'structuredContent.result.simulationStageGraphCreated', equals: true, label: 'simulation stage output graph created' }] },
  // === INFO ===
  { scenario: 'INFO: get_niagara_info', toolName: 'manage_effect', arguments: {"action": "get_niagara_info"}, expected: 'success' },
  // === ACTION ===
  { scenario: 'ACTION: validate_niagara_system', toolName: 'manage_effect', arguments: {"action": "validate_niagara_system"}, expected: 'success' },

  // === CLEANUP ===
  { scenario: 'Cleanup: delete test actor', toolName: 'control_actor', arguments: { action: 'delete', actorName: `TestActor_${ts}` }, expected: 'success|not found' },
  { scenario: 'Cleanup: delete test folder', toolName: 'manage_asset', arguments: { action: 'delete', path: TEST_FOLDER, force: true }, expected: 'success|not found' },
];

runToolTests('manage-effect', testCases);
