import React, { useState } from 'react';
import { Plus, Pin, Link, Trash2, X, Move } from 'lucide-react';
import { MurderBoardNote, MurderBoardConnection, MurderBoardCluster } from '../types/slabletOS';
import { playKeyClick, playOptionSelect } from '../utils/audio';
import './MurderBoardLayer.css';

interface MurderBoardLayerProps {
  layerIndex: number;
  deityColor?: string;
  masterNodes?: Array<{ id: string; title: string; color?: string }>;
  onOpenMasterNode?: (nodeId: string) => void;
}

export const MurderBoardLayer: React.FC<MurderBoardLayerProps> = ({
  layerIndex,
  deityColor = '#ffd700',
  masterNodes = [
    { id: 'master-deity', title: 'Stone of Declaration // Covenant', color: '#ffd700' },
    { id: 'master-konran', title: 'Planet Konran Orbital Telemetry', color: '#39ff14' },
    { id: 'master-kamp', title: 'K.A.M.P. Academy Archives', color: '#ef4444' },
    { id: 'master-dossier', title: 'Slavynian Infiltration Dossier', color: '#ff4444' },
  ],
}) => {
  const [notes, setNotes] = useState<MurderBoardNote[]>(() => {
    try {
      const saved = localStorage.getItem(`konran_murder_notes_L${layerIndex}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [connections, setConnections] = useState<MurderBoardConnection[]>(() => {
    try {
      const saved = localStorage.getItem(`konran_murder_conns_L${layerIndex}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [clusters, setClusters] = useState<MurderBoardCluster[]>(() => {
    try {
      const saved = localStorage.getItem(`konran_murder_clusters_L${layerIndex}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConnectingFrom, setActiveConnectingFrom] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('#fef08a');
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [selectedMaster, setSelectedMaster] = useState<string>('');

  const saveState = (
    nextNotes: MurderBoardNote[],
    nextConns: MurderBoardConnection[],
    nextClusters: MurderBoardCluster[]
  ) => {
    setNotes(nextNotes);
    setConnections(nextConns);
    setClusters(nextClusters);
    try {
      localStorage.setItem(`konran_murder_notes_L${layerIndex}`, JSON.stringify(nextNotes));
      localStorage.setItem(`konran_murder_conns_L${layerIndex}`, JSON.stringify(nextConns));
      localStorage.setItem(`konran_murder_clusters_L${layerIndex}`, JSON.stringify(nextClusters));
    } catch {
      // ignore
    }
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;
    playOptionSelect();
    const newNote: MurderBoardNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteText.trim(),
      color: newNoteColor,
      x: 120 + Math.random() * 200,
      y: 120 + Math.random() * 150,
      width: 180,
      height: 140,
      layerIndex,
      clusterId: selectedCluster || undefined,
      masterNodeId: selectedMaster || undefined,
      isPinned: false,
    };
    saveState([...notes, newNote], connections, clusters);
    setIsAddingNote(false);
    setNewNoteTitle('');
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    playKeyClick();
    const nextNotes = notes.filter((n) => n.id !== id);
    const nextConns = connections.filter((c) => c.fromId !== id && c.toId !== id);
    saveState(nextNotes, nextConns, clusters);
  };

  const handleTogglePin = (id: string) => {
    playKeyClick();
    const nextNotes = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    saveState(nextNotes, connections, clusters);
  };

  const handleStartConnection = (id: string) => {
    playKeyClick();
    if (!activeConnectingFrom) {
      setActiveConnectingFrom(id);
    } else if (activeConnectingFrom === id) {
      setActiveConnectingFrom(null);
    } else {
      // Create connection between activeConnectingFrom and id
      const newConn: MurderBoardConnection = {
        id: `conn-${Date.now()}`,
        fromId: activeConnectingFrom,
        toId: id,
        color: '#ff4444',
        layerIndex,
      };
      saveState(notes, [...connections, newConn], clusters);
      setActiveConnectingFrom(null);
    }
  };

  return (
    <div className="murder-board-root pointer-events-none" aria-label="Tactile Murder Board Canvas">
      {/* SVG Canvas for Yarn / Red Threads connecting Notes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        <defs>
          <filter id="yarnGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn) => {
          const fromNode = notes.find((n) => n.id === conn.fromId);
          const toNode = notes.find((n) => n.id === conn.toId);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + fromNode.width / 2;
          const y1 = fromNode.y + fromNode.height / 2;
          const x2 = toNode.x + toNode.width / 2;
          const y2 = toNode.y + toNode.height / 2;

          return (
            <g key={conn.id}>
              {/* Red Yarn Thread */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="4 2"
                opacity="0.85"
                filter="url(#yarnGlow)"
              />
              {/* Pushpin anchors */}
              <circle cx={x1} cy={y1} r="3" fill="#b91c1c" stroke="#fff" strokeWidth="1" />
              <circle cx={x2} cy={y2} r="3" fill="#b91c1c" stroke="#fff" strokeWidth="1" />
            </g>
          );
        })}
      </svg>

      {/* Render Murder Board Sticky Notes */}
      {notes.map((note) => {
        const isConnecting = activeConnectingFrom === note.id;
        const masterAnchor = masterNodes.find((m) => m.id === note.masterNodeId);

        return (
          <div
            key={note.id}
            className={`murder-board-note pointer-events-auto shadow-xl ${
              note.isPinned ? 'murder-board-note--pinned' : ''
            } ${isConnecting ? 'ring-2 ring-[#ef4444] ring-offset-2 ring-offset-black' : ''}`}
            style={{
              left: `${note.x}px`,
              top: `${note.y}px`,
              width: `${note.width}px`,
              minHeight: `${note.height}px`,
              backgroundColor: note.color,
            }}
          >
            {/* Top Pushpin Header */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/15 text-black/70">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-[#7f1d1d] shadow-sm shrink-0" />
                <span className="font-bold font-mono text-[11px] truncate max-w-[95px]">
                  {note.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartConnection(note.id)}
                  className={`p-0.5 rounded hover:bg-black/15 ${
                    isConnecting ? 'text-[#ef4444]' : 'text-black/60'
                  }`}
                  title="Draw Red Thread to another note"
                >
                  <Link className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleTogglePin(note.id)}
                  className={`p-0.5 rounded hover:bg-black/15 ${
                    note.isPinned ? 'text-black font-bold' : 'text-black/40'
                  }`}
                  title={note.isPinned ? 'Unpin Note' : 'Pin Note in place'}
                >
                  <Pin className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-0.5 rounded hover:bg-black/15 text-black/40 hover:text-red-700"
                  title="Delete Note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Note Content */}
            <div className="text-[10.5px] font-mono text-black/90 leading-tight whitespace-pre-wrap">
              {note.content}
            </div>

            {/* Master Node Link Tag */}
            {masterAnchor && (
              <div className="mt-2 pt-1 border-t border-black/15 flex items-center gap-1 text-[8.5px] font-mono font-bold text-black/70">
                <Move className="w-2.5 h-2.5" />
                <span className="truncate">⚓ {masterAnchor.title}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Floating Murder Board Control Pill (Top Right under HUD) */}
      <div className="fixed top-12 right-14 z-30 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => {
            playKeyClick();
            setIsAddingNote(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/85 border border-[#ffd700]/70 text-[#ffd700] hover:bg-[#ffd700]/15 text-[10px] font-mono shadow-md backdrop-blur-md cursor-pointer transition-colors"
          title="Add Sticky Note to this layer's murder board"
        >
          <Plus className="w-3 h-3" />
          <span>+ Sticky Note</span>
        </button>
      </div>

      {/* Modal / Dialog for creating a new sticky note */}
      {isAddingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-4"
          onClick={() => setIsAddingNote(false)}
        >
          <div
            className="w-80 bg-[#0a0f0d] border border-[#ffd700] rounded p-4 font-mono text-xs text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ffd700]/30 pb-2 mb-3">
              <span className="font-bold text-[#ffd700] flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" />
                <span>New Murder Board Note (Layer {layerIndex})</span>
              </span>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Title</label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Slavyna's Iron Tithe"
                  className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white focus:border-[#ffd700] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">Clue / Deduction</label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Observation notes, suspicious transactions, or linked coordinates..."
                  rows={3}
                  className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white focus:border-[#ffd700] outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">Anchor to Master Node</label>
                <select
                  value={selectedMaster}
                  onChange={(e) => setSelectedMaster(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-[11px] text-white outline-none"
                >
                  <option value="">(None - Independent Note)</option>
                  {masterNodes.map((m) => (
                    <option key={m.id} value={m.id}>
                      ⚓ {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">Note Color</label>
                <div className="flex gap-2">
                  {['#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fed7aa'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setNewNoteColor(col)}
                      className={`w-6 h-6 rounded-full border ${
                        newNoteColor === col ? 'border-white scale-110' : 'border-black/30'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="px-3 py-1 rounded bg-[#ffd700] text-black font-bold text-xs hover:bg-[#ffe234]"
                >
                  Pin Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
