import React, { useState } from 'react';
import { 
  Terminal, 
  Plus, 
  Trash2, 
  Send, 
  Palette, 
  Sparkles, 
  Shield, 
  Cpu, 
  BookOpen, 
  GraduationCap, 
  Orbit, 
  Clock 
} from 'lucide-react';
import { CanvasWindowState } from '../types';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface CustomTerminalViewProps {
  window: CanvasWindowState;
  onUpdateWindow: (updated: Partial<CanvasWindowState>) => void;
  onLaunchWindow: (type: CanvasWindowState['type'], title: string) => void;
}

const PRESET_ACCENTS = [
  { name: 'Phosphor Green', value: '#39ff14' },
  { name: 'Arcane Amber', value: '#ffcc00' },
  { name: 'Magitech Cyan', value: '#00e5a3' },
  { name: 'Celestial Violet', value: '#c49cff' },
  { name: 'Solar Crimson', value: '#ff4d4d' },
];

export const CustomTerminalView: React.FC<CustomTerminalViewProps> = ({
  window,
  onUpdateWindow,
  onLaunchWindow,
}) => {
  const custom = window.customData || {};
  const [activeTab, setActiveTab] = useState<'console' | 'notes' | 'designer'>('console');
  const [inputCommand, setInputCommand] = useState('');
  const [terminalLabel, setTerminalLabel] = useState(custom.terminalName || window.title);
  const [notes, setNotes] = useState(custom.notesText || '');

  const logs = custom.commandLog || [
    'SYSTEM INITIALIZED // SLABLET NODE ATTACHED',
    `DIAGNOSTIC CHANNEL: ${window.id}`,
    'AWAITING MAGITECH TELEMETRY QUERY...',
  ];

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    playKeyClick();

    const cmd = inputCommand.trim();
    const upper = cmd.toUpperCase();
    let response = `> ${cmd}: COMMAND ACKNOWLEDGED`;

    if (upper === 'HELP') {
      response = '> AVAILABLE: HELP, CLEAR, STATUS, LAUNCH <CODEX|CHRONO|BADGE|KAMP|EXCHANGE>, SCAN, LEYLINES';
    } else if (upper === 'CLEAR') {
      onUpdateWindow({
        customData: {
          ...custom,
          commandLog: ['[CONSOLE LOG PURGED]'],
        },
      });
      setInputCommand('');
      return;
    } else if (upper.startsWith('LAUNCH ')) {
      const target = upper.replace('LAUNCH ', '').trim();
      if (target.includes('CODEX')) {
        onLaunchWindow('codex', 'Pantheon Codex');
        response = '> LAUNCHING PANTHEON CODEX NODE...';
      } else if (target.includes('CHRONO')) {
        onLaunchWindow('chronometron', 'Grand Chronometron');
        response = '> LAUNCHING GRAND CHRONOMETRON NODE...';
      } else if (target.includes('BADGE')) {
        onLaunchWindow('badge', 'Fated Covenant Badge');
        response = '> LAUNCHING FATED COVENANT BADGE...';
      } else if (target.includes('KAMP')) {
        onLaunchWindow('kamp', 'K.A.M.P. Terminal');
        response = '> LAUNCHING K.A.M.P. ACADEMIC LINK...';
      } else if (target.includes('EXCHANGE')) {
        onLaunchWindow('exchange', 'Obsydian Exchange');
        response = '> LAUNCHING OBSYDIAN MARKET UPLINK...';
      } else {
        response = `> ERROR: UNRECOGNIZED MODULE "${target}". TRY CODEX, CHRONO, BADGE, KAMP, EXCHANGE`;
      }
    } else if (upper === 'STATUS') {
      response = `> NODE STATUS: ONLINE // FLUIDITY 99.8% // MEMORY RESTRAINT OPTIMAL`;
    } else if (upper === 'SCAN' || upper === 'LEYLINES') {
      response = `> SCANNING PLANETARY SURFACE: 9 DIVINE CONDUITS ACTIVE. HARMONIC VIBRATION: STABLE.`;
    }

    onUpdateWindow({
      customData: {
        ...custom,
        commandLog: [...logs, `> ${cmd}`, response].slice(-30),
      },
    });
    setInputCommand('');
  };

  const handleUpdateNotes = (text: string) => {
    setNotes(text);
    onUpdateWindow({
      customData: {
        ...custom,
        notesText: text,
      },
    });
  };

  const handleSetAccent = (color: string) => {
    playOptionSelect();
    onUpdateWindow({
      customData: {
        ...custom,
        accentColor: color,
      },
    });
  };

  const handleSaveTitle = () => {
    playKeyClick();
    onUpdateWindow({
      title: terminalLabel,
      customData: {
        ...custom,
        terminalName: terminalLabel,
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-xs select-text">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#39ff14]/20 bg-black/40 px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { playKeyClick(); setActiveTab('console'); }}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
              activeTab === 'console'
                ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Terminal Console
          </button>
          <button
            onClick={() => { playKeyClick(); setActiveTab('notes'); }}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Custom Log & Notes
          </button>
          <button
            onClick={() => { playKeyClick(); setActiveTab('designer'); }}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
              activeTab === 'designer'
                ? 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/50'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Design / Config
          </button>
        </div>

        <span className="text-[10px] text-white/40 tracking-wider hidden sm:inline">
          {window.id.substring(0, 10)}
        </span>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'console' && (
          <div className="flex flex-col h-full justify-between gap-3">
            <div className="flex-1 bg-black/60 border border-[#39ff14]/20 p-2.5 rounded font-mono text-[11px] overflow-y-auto space-y-1">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.startsWith('>')
                      ? 'text-[#ffcc00]'
                      : log.includes('ERROR')
                      ? 'text-red-400'
                      : 'text-[#39ff14]/90'
                  }
                >
                  {log}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendCommand} className="flex gap-2 shrink-0">
              <span className="text-[#39ff14] self-center">&gt;</span>
              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                placeholder="Enter command (e.g., HELP, LAUNCH CODEX, SCAN)..."
                className="flex-1 bg-black/80 border border-[#39ff14]/40 rounded px-2.5 py-1.5 text-[#39ff14] placeholder-white/20 text-xs focus:outline-none focus:border-[#39ff14]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 text-[#39ff14] border border-[#39ff14]/50 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>EXEC</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col h-full gap-2">
            <label className="text-[11px] text-[#ffcc00] uppercase tracking-wider flex items-center justify-between">
              <span>Personal Field Notes & Telemetry Observations</span>
              <span className="text-[10px] text-white/40">Auto-saved to Canvas Node</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              placeholder="Record planetary observations, leyline frequencies, party communications, or DM quest notes here..."
              className="w-full flex-1 bg-black/70 border border-[#ffcc00]/30 rounded p-3 text-white/90 placeholder-white/25 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#ffcc00] resize-none"
            />
          </div>
        )}

        {activeTab === 'designer' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#39ff14] uppercase tracking-wider block">
                Screen / Terminal Label
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={terminalLabel}
                  onChange={(e) => setTerminalLabel(e.target.value)}
                  className="flex-1 bg-black/80 border border-white/20 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#39ff14]"
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-3 py-1.5 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 text-[#39ff14] border border-[#39ff14]/50 rounded text-xs cursor-pointer"
                >
                  Rename Screen
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-[#39ff14] uppercase tracking-wider block">
                Window Accent Theme
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ACCENTS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleSetAccent(preset.value)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/60 border hover:bg-white/5 cursor-pointer text-[11px] transition-all"
                    style={{
                      borderColor: preset.value,
                      color: preset.value,
                      boxShadow: (custom.accentColor || '#39ff14') === preset.value ? `0 0 10px ${preset.value}55` : 'none',
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] text-[#ffcc00] uppercase tracking-wider block">
                Quick Deploy Companion Screens
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => onLaunchWindow('codex', 'Pantheon Codex')}
                  className="p-2 bg-black/50 border border-white/20 rounded hover:border-[#39ff14] text-left text-xs cursor-pointer text-white/80 hover:text-white"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#39ff14] mb-1" />
                  <div className="font-bold text-[11px]">Codex Window</div>
                  <div className="text-[9px] text-white/50">Pantheon & World Lore</div>
                </button>
                <button
                  onClick={() => onLaunchWindow('chronometron', 'Grand Chronometron')}
                  className="p-2 bg-black/50 border border-white/20 rounded hover:border-[#ffd700] text-left text-xs cursor-pointer text-white/80 hover:text-white"
                >
                  <Clock className="w-3.5 h-3.5 text-[#ffd700] mb-1" />
                  <div className="font-bold text-[11px]">Chronometron</div>
                  <div className="text-[9px] text-white/50">36-Hr Diurnal Dial</div>
                </button>
                <button
                  onClick={() => onLaunchWindow('badge', 'Fated Covenant Badge')}
                  className="p-2 bg-black/50 border border-white/20 rounded hover:border-[#ffcc00] text-left text-xs cursor-pointer text-white/80 hover:text-white"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ffcc00] mb-1" />
                  <div className="font-bold text-[11px]">Fated Badge</div>
                  <div className="text-[9px] text-white/50">Trials & Alignment</div>
                </button>
                <button
                  onClick={() => onLaunchWindow('kamp', 'K.A.M.P. Terminal')}
                  className="p-2 bg-black/50 border border-white/20 rounded hover:border-[#00e5a3] text-left text-xs cursor-pointer text-white/80 hover:text-white"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#00e5a3] mb-1" />
                  <div className="font-bold text-[11px]">K.A.M.P. Academy</div>
                  <div className="text-[9px] text-white/50">Transcripts & Houses</div>
                </button>
                <button
                  onClick={() => onLaunchWindow('exchange', 'Obsydian Exchange')}
                  className="p-2 bg-black/50 border border-white/20 rounded hover:border-[#c49cff] text-left text-xs cursor-pointer text-white/80 hover:text-white"
                >
                  <Orbit className="w-3.5 h-3.5 text-[#c49cff] mb-1" />
                  <div className="font-bold text-[11px]">Exchange</div>
                  <div className="text-[9px] text-white/50">Market Uplink</div>
                </button>
                <button
                  onClick={() => onLaunchWindow('party', 'Adventuring Party Roster')}
                  className="p-2 bg-black/50 border border-white/20 rounded hover:border-amber-400 text-left text-xs cursor-pointer text-white/80 hover:text-white"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400 mb-1" />
                  <div className="font-bold text-[11px]">Party Roster</div>
                  <div className="text-[9px] text-white/50">Vault Records</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
