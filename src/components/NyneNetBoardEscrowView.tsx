import React, { useState } from 'react';
import { Radio, ScrollText, ShieldCheck, PackageCheck, Send, Coins, MapPin } from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { useGMFeed } from '../hooks/useGMFeed';
import { saveToVault, loadFromVault, enqueueVaultSync } from '../utils/vault';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface BoardPost {
  id: string;
  channel: 'world_wire' | 'bounties' | 'dead_drops';
  author: string;
  location: string;
  content: string;
  reward?: string;
  timestamp: string;
}

interface EscrowListing {
  id: string;
  seller: string;
  itemName: string;
  originCity: string;
  priceGc: number;
  escrowVerified: boolean;
  status: 'open' | 'in_escrow' | 'claimed';
}

const DEFAULT_POSTS: BoardPost[] = [
  {
    id: 'post-1',
    channel: 'world_wire',
    author: 'Lyricia Courier Dispatch',
    location: 'Padd City // Olyvia',
    content: 'Grand Balance Audit announced for Day 27 of Lyricia’s Ledger. Trans-continental waybill tariffs reduced by 15% for Prestige 1+ holders.',
    timestamp: 'Pass I · 07:42',
  },
  {
    id: 'post-2',
    channel: 'bounties',
    author: 'Harbormaster Vance',
    location: 'Crafton Cove // Kray Providence',
    content: 'WANTED: Salvage crew to recover a sunken Spynx magitech telemetry buoy near the eastern sea-arches before Spring Tide.',
    reward: '180 gc + +0.50 Kray Providence Standing',
    timestamp: 'Pass I · 09:15',
  },
  {
    id: 'post-3',
    channel: 'dead_drops',
    author: 'Cipher-9 (Booth IX)',
    location: 'The Mydnight Rendezvous // Crafton Cove',
    content: 'Left an encrypted slablet shard beneath the violet Ayanath lamp at Booth IX. Mention "Keztox Blind-Spot" to Madame Vespera.',
    timestamp: 'Pass II · 21:08',
  },
];

const DEFAULT_ESCROW: EscrowListing[] = [
  {
    id: 'esc-1',
    seller: 'Kelth Treasury Factors',
    itemName: 'Sunfire Chrysoberyl Resonance Lens (+1 Arcane Focus)',
    originCity: 'Vantya',
    priceGc: 250,
    escrowVerified: true,
    status: 'open',
  },
  {
    id: 'esc-2',
    seller: 'Quartermaster Ren (House Spynx)',
    itemName: 'Ayanath Ward Clockwork Signet',
    originCity: 'K.A.M.P. Citadel',
    priceGc: 140,
    escrowVerified: true,
    status: 'open',
  },
  {
    id: 'esc-3',
    seller: 'Captain Corta',
    itemName: 'Cask of Lantyca Rainforest Spout-Elixir',
    originCity: 'Crafton Cove',
    priceGc: 65,
    escrowVerified: true,
    status: 'open',
  },
];

export const NyneNetBoardEscrowView: React.FC = () => {
  const { activeCharacter } = useCharacter();
  const { events } = useGMFeed({ characterId: activeCharacter?.id });
  const [tab, setTab] = useState<'world_wire' | 'bounties' | 'dead_drops' | 'escrow'>('world_wire');

  const [posts, setPosts] = useState<BoardPost[]>(() =>
    loadFromVault<BoardPost[]>('nyneNet.posts', DEFAULT_POSTS)
  );
  const [escrowItems, setEscrowItems] = useState<EscrowListing[]>(() =>
    loadFromVault<EscrowListing[]>('nyneNet.escrow', DEFAULT_ESCROW)
  );
  const [newNote, setNewNote] = useState('');
  const [newLocation, setNewLocation] = useState('Crafton Cove // The Mydnight Rendezvous');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('100');

  // Combine GM Switchboard live rumors into World Wire
  const gmRumors: BoardPost[] = events
    .filter((e) => e.reputation?.rumorNote || e.handout?.title)
    .map((e) => ({
      id: `gm-${e.id}`,
      channel: 'world_wire',
      author: 'GM Switchboard // World Wire',
      location: e.campaignName || 'Planetary Broadcast',
      content:
        e.reputation?.rumorNote ||
        `${e.handout?.title || 'Broadcast'}: ${e.handout?.summary || ''}`,
      timestamp: new Date(e.timestamp).toLocaleTimeString(),
    }));

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    playKeyClick();
    const channel = tab === 'escrow' ? 'world_wire' : tab;
    const item: BoardPost = {
      id: `post-${Date.now()}`,
      channel,
      author: activeCharacter?.name || 'Fated Envoy',
      location: newLocation,
      content: newNote.trim(),
      timestamp: 'Live Pass',
    };
    const next = [item, ...posts];
    setPosts(next);
    saveToVault('nyneNet.posts', next);
    enqueueVaultSync('nyne_net_post', item);
    setNewNote('');
  };

  const handleListEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    playKeyClick();
    const item: EscrowListing = {
      id: `esc-${Date.now()}`,
      seller: activeCharacter?.name || 'Fated Envoy',
      itemName: newItemName.trim(),
      originCity: 'Padd City Escrow Vault',
      priceGc: Math.max(1, Number(newItemPrice) || 50),
      escrowVerified: true,
      status: 'open',
    };
    const next = [item, ...escrowItems];
    setEscrowItems(next);
    saveToVault('nyneNet.escrow', next);
    enqueueVaultSync('lyricia_escrow_list', item);
    setNewItemName('');
  };

  const handleClaimEscrow = (id: string) => {
    playOptionSelect();
    const next = escrowItems.map((it) =>
      it.id === id ? { ...it, status: it.status === 'open' ? ('in_escrow' as const) : ('claimed' as const) } : it
    );
    setEscrowItems(next);
    saveToVault('nyneNet.escrow', next);
  };

  const visiblePosts = [...gmRumors, ...posts].filter((p) => p.channel === tab);

  return (
    <div className="w-full h-full bg-[#0a0515] text-[#e9d5ff] font-mono p-3 sm:p-4 overflow-y-auto space-y-3 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c084fc]/30 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c084fc]">
            <Radio className="w-4 h-4 text-[#39ff14]" />
            <span>The Nyne Net (Layer 1) // Cross-Campaign Board &amp; Lyricia Courier Escrow</span>
          </div>
          <p className="text-[10px] text-purple-300/70">
            Public Planetary Network · Verified by the Treasurers of Kelth &amp; Gilded Ledger Exchange
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { id: 'world_wire', label: 'World Wire (Rumors)' },
            { id: 'bounties', label: 'Bounties & Contracts' },
            { id: 'dead_drops', label: 'Dead Drops / Tavern Notes' },
            { id: 'escrow', label: 'Lyricia Courier Escrow' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playOptionSelect();
                setTab(t.id as any);
              }}
              className={`px-2 py-1 rounded text-[10px] border cursor-pointer transition-colors ${
                tab === t.id
                  ? 'bg-[#c084fc] text-black font-bold border-[#c084fc]'
                  : 'bg-purple-950/50 text-purple-200 border-[#c084fc]/30 hover:border-[#c084fc]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab !== 'escrow' ? (
        <div className="space-y-3">
          {/* Post Composer */}
          <form onSubmit={handleAddPost} className="bg-black/50 border border-[#c084fc]/30 rounded p-2.5 space-y-2">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Origin Node / Tavern..."
                className="bg-[#140826] border border-[#c084fc]/30 rounded px-2 py-1 text-[11px] text-purple-200 w-48"
              />
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`Post to ${tab.replace('_', ' ').toUpperCase()}...`}
                className="flex-1 min-w-[180px] bg-[#140826] border border-[#c084fc]/30 rounded px-2.5 py-1 text-[11px] text-white"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-[#a855f7] hover:bg-[#c084fc] text-black font-bold text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" /> Transmit
              </button>
            </div>
          </form>

          {/* Feed Items */}
          <div className="space-y-2">
            {visiblePosts.map((post) => (
              <div
                key={post.id}
                className="p-3 rounded bg-[#140926]/80 border border-[#c084fc]/30 hover:border-[#c084fc]/60 space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between text-[10px] text-purple-300/80">
                  <span className="font-bold text-[#c084fc] flex items-center gap-1">
                    <ScrollText className="w-3 h-3" /> {post.author}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <MapPin className="w-3 h-3" /> {post.location} · {post.timestamp}
                  </span>
                </div>
                <p className="text-xs text-white leading-relaxed font-sans">{post.content}</p>
                {post.reward && (
                  <div className="text-[10px] text-[#39ff14] font-bold pt-1">
                    ✦ Contract Stipend: {post.reward}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Escrow Listing Form */}
          <form onSubmit={handleListEscrow} className="bg-black/50 border border-[#c084fc]/30 rounded p-2.5 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item / Relic to place in Lyricia Courier Escrow..."
              className="flex-1 min-w-[180px] bg-[#140826] border border-[#c084fc]/30 rounded px-2.5 py-1 text-[11px] text-white"
            />
            <div className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-20 bg-[#140826] border border-[#c084fc]/30 rounded px-2 py-1 text-[11px] text-amber-300"
              />
              <span className="text-[10px] text-amber-300">gc</span>
            </div>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <PackageCheck className="w-3 h-3" /> Seal in Escrow
            </button>
          </form>

          {/* Escrow Items */}
          <div className="space-y-2">
            {escrowItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded bg-[#140926]/80 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.itemName}</span>
                    {item.escrowVerified && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/50 text-[9px] text-[#39ff14] flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> LYRICIA SEALED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-purple-300/80 mt-0.5">
                    Consignor: {item.seller} · Vault: {item.originCity}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">{item.priceGc} gc</span>
                  <button
                    onClick={() => handleClaimEscrow(item.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                      item.status === 'open'
                        ? 'bg-[#c084fc] text-black border-[#c084fc]'
                        : item.status === 'in_escrow'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-400'
                        : 'bg-emerald-950/80 text-[#39ff14] border-emerald-500'
                    }`}
                  >
                    {item.status === 'open'
                      ? 'Initiate Escrow'
                      : item.status === 'in_escrow'
                      ? 'In Courier Transit'
                      : 'Delivered ✓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default NyneNetBoardEscrowView;
