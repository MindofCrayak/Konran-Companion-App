export interface FutureDeckModuleStub {
  index: number;
  id: string;
  title: string;
  phase: 2 | 3;
  inspiration: string;
  primaryStat: 'INT' | 'DEX' | 'WIS' | 'CHA';
  hardwareDependency: string;
  summary: string;
  interactiveTelemetryPreview: string;
}

export const PHASE_2_AND_3_MODULE_STUBS: FutureDeckModuleStub[] = [
  {
    index: 6,
    id: 'keystroke_injection',
    title: '6. Keystroke Injection',
    phase: 2,
    inspiration: 'Hacknet / Watch Dogs Rapid Payload Spoofing',
    primaryStat: 'DEX',
    hardwareDependency: 'Jack-in Spike Tier 2+',
    summary: 'Inject forged packet headers during micro-second interrupt windows between firewall heartbeats.',
    interactiveTelemetryPreview: 'INTERRUPT_WINDOW: 140ms | PACKET_SPOOF_READY: [0x9A -> 0xFF]',
  },
  {
    index: 7,
    id: 'kinetic_pin_timing',
    title: '7. Kinetic Pin Timing',
    phase: 2,
    inspiration: 'Oblivion / Cyberpunk Mag-Lock Tumbler',
    primaryStat: 'DEX',
    hardwareDependency: 'Reflex Synapse Accelerator',
    summary: 'Jolt electromagnetic shear-pins at resonant apex height without snapping the torsion pulse.',
    interactiveTelemetryPreview: 'TUMBLER_PINS: [LOCKED][LOCKED][SHEAR_APEX][FREE]',
  },
  {
    index: 8,
    id: 'noise_slice_assembly',
    title: '8. Noise/Slice Assembly',
    phase: 2,
    inspiration: 'Signalis / Observation Corrupted Frame Reconstruction',
    primaryStat: 'INT',
    hardwareDependency: 'Ocular Glyph Scanner',
    summary: 'Re-align phase-shifted holographic scanlines to reconstruct a corrupted security schematic.',
    interactiveTelemetryPreview: 'SCANLINE_COHERENCE: 78.4% | SLICES_ALIGNED: 5/6',
  },
  {
    index: 9,
    id: 'voltage_balancing',
    title: '9. Voltage Balancing',
    phase: 2,
    inspiration: 'Subnautica / Barotrauma Junction Load Redistribution',
    primaryStat: 'INT',
    hardwareDependency: 'Neural Co-Processor Mk.II',
    summary: 'Balance three-phase mana-capacitor rails to exact kilovolt thresholds before thermal runaway.',
    interactiveTelemetryPreview: 'RAIL_A: 4.2kV | RAIL_B: 4.1kV | RAIL_C: 4.2kV [BALANCED]',
  },
  {
    index: 10,
    id: 'gyro_maze',
    title: '10. Gyro Maze',
    phase: 3,
    inspiration: 'Breath of the Wild / Deus Ex Micro-Drone Conduit Piloting',
    primaryStat: 'DEX',
    hardwareDependency: 'DeviceOrientation / Touch Tilt Gimbal',
    summary: 'Guide a micro-arc spark through an energized 3D stator labyrinth using tilt or dual-axis sliders.',
    interactiveTelemetryPreview: 'GIMBAL_PITCH: +4.2° | ROLL: -1.8° | COLLISION_MARGIN: 92%',
  },
  {
    index: 11,
    id: 'vector_ice_shooter',
    title: '11. Vector ICE Shooter',
    phase: 3,
    inspiration: 'NieR: Automata Twin-Stick Hacking Arena',
    primaryStat: 'DEX',
    hardwareDependency: 'Black-ICE Breaker Co-Proc',
    summary: 'Pilot an avatar wedge inside a radial vector arena, stripping shielding nodes off Hunter-Killer ICE.',
    interactiveTelemetryPreview: 'AVATAR_HULL: 100% | BLACK_ICE_CORE: 32% | PULSE_RATE: 60Hz',
  },
  {
    index: 12,
    id: 'command_line_decking',
    title: '12. Command-Line Decking',
    phase: 3,
    inspiration: 'Uplink / GTFO Terminal Shell',
    primaryStat: 'INT',
    hardwareDependency: 'Oray Tactical Slablet Mk-IV+',
    summary: 'Execute diegetic shell directives (`probe`, `spoof`, `tun`, `kill -9`) against live node IP tables.',
    interactiveTelemetryPreview: 'root@corenet-node07:~# spoof --mac 00:A4:FF:12 --stealth [OK]',
  },
  {
    index: 13,
    id: 'mainframe_raid',
    title: '13. Mainframe Raid',
    phase: 3,
    inspiration: 'Co-op Multi-Slablet Synchronized Breach',
    primaryStat: 'INT',
    hardwareDependency: 'Party Sync Relay / Tier 4 Void-Engine',
    summary: 'Coordinate simultaneous dual-operative sub-routines to drop air-gapped citadel vaults.',
    interactiveTelemetryPreview: 'OPERATIVE_1: GATE_LOCKED | OPERATIVE_2: PAYLOAD_ARMED [SYNC_READY]',
  },
  {
    index: 14,
    id: 'ring_decoders',
    title: '14. Ring Decoders',
    phase: 3,
    inspiration: 'The Da Vinci Code / Skyrim Dwemer Concentric Cryptex',
    primaryStat: 'WIS',
    hardwareDependency: 'Harmonic Cochlear Stabilizer',
    summary: 'Rotate concentric planetary and Orayic rune rings until radial laser pathways lock into alignment.',
    interactiveTelemetryPreview: 'RING_OUTER: 120° | RING_MID: 240° | RING_INNER: 0° [ALIGNMENT_LOCK]',
  },
];

export function simulatePhaseStubPing(stubId: string): {
  stub: FutureDeckModuleStub | undefined;
  diagnosticOutput: string;
} {
  const stub = PHASE_2_AND_3_MODULE_STUBS.find((s) => s.id === stubId);
  if (!stub) {
    return {
      stub: undefined,
      diagnosticOutput: 'ERROR: Unknown Phase 2/3 stub module identifier.',
    };
  }
  return {
    stub,
    diagnosticOutput: `[PHASE ${stub.phase} DIAGNOSTIC SIM] ${stub.title} :: ${stub.interactiveTelemetryPreview}`,
  };
}
