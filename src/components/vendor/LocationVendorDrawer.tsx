import React, { useMemo, useState } from 'react';
import {
  Store,
  Terminal,
  MessageSquare,
  Dices,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { CharacterProfile } from '../../types';
import { abilityMod } from '../../engine/computedParams';
import { emitDiscordDMWebhook } from '../../engine/externalWebhooks';

export interface VendorCatalogItem {
  id: string;
  name: string;
  category: 'Cyberware' | 'Deck Hardware' | 'Consumable' | 'Relic';
  basePriceGp: number;
  settlementTier: 'Outpost' | 'Trade Hub' | 'Citadel Metropolis';
  description: string;
}

export interface LocationVendorDrawerProps {
  character?: CharacterProfile | null;
  settlementName?: string;
  settlementTier?: 'Outpost' | 'Trade Hub' | 'Citadel Metropolis';
  prestigeLevel?: number;
  reputationScore?: number;
  onOpenPublicDataterm?: () => void;
}

const VENDOR_INVENTORY: VendorCatalogItem[] = [
  {
    id: 'item_stim_pack_mk2',
    name: 'Oray Chrono-Stim Injector',
    category: 'Consumable',
    basePriceGp: 80,
    settlementTier: 'Outpost',
    description: 'Restores 2d8+4 HP and clears 1 level of synaptic exhaustion.',
  },
  {
    id: 'item_signal_skimmer_coil',
    name: 'Dual-Band Signal Skimmer Coil',
    category: 'Deck Hardware',
    basePriceGp: 240,
    settlementTier: 'Outpost',
    description: 'Dampens Waveform Lock oscillator drift by 15%.',
  },
  {
    id: 'item_ocular_glyph_scanner',
    name: 'Ocular Glyph Scanner Implant',
    category: 'Cyberware',
    basePriceGp: 650,
    settlementTier: 'Trade Hub',
    description: '+3 Passive Perception for linguistic steganography and packet parity.',
  },
  {
    id: 'item_slavyna_whisper_deck',
    name: 'Slavyna Whisper-Weave Deck (Tier 3)',
    category: 'Deck Hardware',
    basePriceGp: 1400,
    settlementTier: 'Trade Hub',
    description: '8-slot RAM buffer, 2 automatic dud prunes, 30% diagnostic trace slowdown.',
  },
  {
    id: 'item_krayvuk_void_shard',
    name: 'Krayvuk Void-Engine Co-Processor',
    category: 'Relic',
    basePriceGp: 3200,
    settlementTier: 'Citadel Metropolis',
    description: 'Tier 4 black-ice shard granting maximum daemon buffer expansion.',
  },
];

export function computePrestigeDiscountPct(
  prestigeLevel: number,
  reputationScore: number
): number {
  const raw = prestigeLevel * 5 + reputationScore / 20;
  return Math.min(25, Math.max(0, Number(raw.toFixed(1))));
}

export const LocationVendorDrawer: React.FC<LocationVendorDrawerProps> = ({
  character = null,
  settlementName = 'Lyricia Neon Bazaar — Sector 04',
  settlementTier = 'Citadel Metropolis',
  prestigeLevel = 2,
  reputationScore = 100,
  onOpenPublicDataterm,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [haggleBonusPct, setHaggleBonusPct] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'npc' | 'player'; text: string }>
  >([
    {
      sender: 'npc',
      text: `Welcome to ${settlementName}, operative. My ledger recognizes your Slablet signature. Care to browse hardware or test your luck haggling?`,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  const chaMod = abilityMod(character?.stats?.cha ?? 14);
  const profBonus = character?.stats?.proficiencyBonus ?? 2;

  const basePrestigePct = useMemo(
    () => computePrestigeDiscountPct(prestigeLevel, reputationScore),
    [prestigeLevel, reputationScore]
  );

  const totalDiscountPct = Math.min(35, basePrestigePct + haggleBonusPct);

  const availableInventory = useMemo(() => {
    if (settlementTier === 'Outpost') {
      return VENDOR_INVENTORY.filter((i) => i.settlementTier === 'Outpost');
    }
    if (settlementTier === 'Trade Hub') {
      return VENDOR_INVENTORY.filter((i) => i.settlementTier !== 'Citadel Metropolis');
    }
    return VENDOR_INVENTORY;
  }, [settlementTier]);

  const handleHaggleCheck = async (
    skill: 'Persuasion' | 'Deception' | 'Intimidation'
  ) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + chaMod + profBonus;
    const dc = 14;
    const success = total >= dc || d20 === 20;
    const extraDiscount = success ? (d20 === 20 ? 10 : 5) : 0;

    if (success) {
      setHaggleBonusPct(extraDiscount);
    }

    const playerMsg = `[🎲 ${skill} Check] Rolled D20(${d20}) + ${
      chaMod + profBonus
    } = ${total} vs DC ${dc}`;
    const npcReply = success
      ? `Sharp tongue, operative. I'll shave an extra ${extraDiscount}% off the guild tariff.`
      : `Nice try, choom, but the Lyrician Syndicate sets these floor prices. No extra cut.`;

    setChatHistory((prev) => [
      ...prev,
      { sender: 'player', text: playerMsg },
      { sender: 'npc', text: npcReply },
    ]);

    await emitDiscordDMWebhook('vendor_activity', {
      type: 'haggle_check',
      characterName: character?.name ?? 'Operative',
      settlementName,
      skill,
      d20,
      total,
      dc,
      success,
      totalDiscountPct: Math.min(35, basePrestigePct + extraDiscount),
    });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatInput('');

    const reply =
      userText.toLowerCase().includes('deck') || userText.toLowerCase().includes('ware')
        ? 'All cyberware on this rack is clean of Krayvuk trackers. Check the Prestige discount column.'
        : `Noted, operative. In ${settlementName}, credits and reputation speak louder than prayers.`;

    setChatHistory((prev) => [
      ...prev,
      { sender: 'player', text: userText },
      { sender: 'npc', text: reply },
    ]);

    await emitDiscordDMWebhook('vendor_activity', {
      type: 'vendor_chat',
      characterName: character?.name ?? 'Operative',
      settlementName,
      message: userText,
    });
  };

  const handlePurchase = async (item: VendorCatalogItem, finalPriceGp: number) => {
    if (purchasedIds.includes(item.id)) return;
    setPurchasedIds([...purchasedIds, item.id]);
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'npc',
        text: `Transaction locked: [${item.name}] transferred for ${finalPriceGp} GP (${totalDiscountPct}% total discount).`,
      },
    ]);

    await emitDiscordDMWebhook('vendor_activity', {
      type: 'purchase',
      characterName: character?.name ?? 'Operative',
      settlementName,
      itemId: item.id,
      itemName: item.name,
      finalPriceGp,
      totalDiscountPct,
    });
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-zinc-950/95 text-zinc-100 overflow-hidden shadow-xl">
      {/* Location-Proximity HUD Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
            Shopping &amp; Public Terminals Available :: {settlementName} ({settlementTier})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPublicDataterm && (
            <button
              type="button"
              onClick={onOpenPublicDataterm}
              className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/50 px-2.5 py-1 text-xs font-mono text-cyan-300 hover:bg-cyan-900/60"
            >
              <Cpu className="h-3.5 w-3.5" />
              [Hack Public Dataterm]
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-800"
          >
            {isOpen ? (
              <>
                Collapse <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Open Vendor <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 7 cols: Settlement-Scaled Inventory & Prestige Formula */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Prestige Discount: <strong>{basePrestigePct}%</strong> (Prestige {prestigeLevel}*5% + Rep{' '}
                {reputationScore}/20%)
              </span>
              <span className="text-emerald-300 font-bold">
                Total Active Discount: {totalDiscountPct}%
              </span>
            </div>

            <div className="space-y-2">
              {availableInventory.map((item) => {
                const finalPrice = Math.max(
                  1,
                  Math.round(item.basePriceGp * (1 - totalDiscountPct / 100))
                );
                const bought = purchasedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{item.name}</span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-amber-300">{finalPrice} GP</div>
                        {totalDiscountPct > 0 && (
                          <div className="text-[10px] text-zinc-500 line-through">
                            {item.basePriceGp} GP
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={bought}
                        onClick={() => handlePurchase(item, finalPrice)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase ${
                          bought
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500 text-black hover:bg-amber-400'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {bought ? 'Acquired' : 'Buy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Interactive NPC Vendor Chatbot & 5e Haggling Checks */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-lg border border-zinc-800 bg-black/80 p-3 space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-300">
                  <MessageSquare className="h-3.5 w-3.5" /> Quartermaster Vane-9 (NPC Vendor)
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Silent DM Log Active</span>
              </div>

              {/* 5e Haggling Skill Buttons */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {(['Persuasion', 'Deception', 'Intimidation'] as const).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleHaggleCheck(skill)}
                    className="flex items-center justify-center gap-1 rounded border border-amber-500/30 bg-amber-950/30 py-1.5 text-[10px] font-mono text-amber-200 hover:bg-amber-900/50"
                  >
                    <Dices className="h-3 w-3" /> {skill}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs font-mono">
                {chatHistory.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded p-2 ${
                      m.sender === 'npc'
                        ? 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                        : 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/30 ml-4'
                    }`}
                  >
                    <span className="font-bold uppercase text-[10px] block opacity-70">
                      {m.sender === 'npc' ? 'Quartermaster Vane-9' : character?.name ?? 'Operative'}
                    </span>
                    {m.text}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendChat} className="flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask vendor about cyberware or rumors..."
                className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs font-mono text-zinc-200"
              />
              <button
                type="submit"
                className="rounded bg-amber-500 px-3 py-1.5 text-xs font-mono font-bold uppercase text-black hover:bg-amber-400"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationVendorDrawer;
