import React, { useState } from 'react';
import { 
  Coins, 
  ArrowRightLeft, 
  Scale, 
  Landmark, 
  Sparkles, 
  Eye, 
  Search, 
  ZoomIn, 
  ShieldCheck, 
  Layers, 
  Compass, 
  ChevronRight,
  RotateCw
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';

// Canonical Denominations of the Konran System from Official Infographic & Numismatic Guide
export interface CoinSpecimen {
  id: string;
  name: string;
  alias: string;
  shape: string;
  chosenBy: string;
  rateToGp: number;
  weightGrams: number;
  purity: string;
  mintMark: string;
  description: string;
  badgeColor: string;
  specimenImage: string;
  obverseNotes: string;
  reverseNotes: string;
}

export const CANON_SPECIMENS: CoinSpecimen[] = [
  {
    id: 'platinum-lute-pick',
    name: 'Platinum Lute Pick (PP)',
    alias: 'The Maestro Pick',
    shape: 'Curved Tri-Point Lute Pick',
    chosenBy: 'Celeste (Goddess of War, Art & Song)',
    rateToGp: 10.0,
    weightGrams: 28.4,
    purity: '99.4% Fine Celestial Platinum',
    mintMark: 'Cadence Citadel Bastion Die // Leste Mint',
    description: 'Offered from Celeste\'s favorite lute pick. Bards across all Providences prize them as sacred relics, and folklore boasts that a true bard will part with their soul before their last pick.',
    badgeColor: '#e5e7eb',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_1.png',
    obverseNotes: 'Embossed with the heraldic lute strings of Cadence and twin crossed lances of the Sororal Guard.',
    reverseNotes: 'Intaglio nonagon border framing Celeste\'s martial motto and purity guarantee mark.',
  },
  {
    id: 'gold-spiked-link',
    name: 'Gold Spiked Link (GP)',
    alias: 'Kay\'s Spiked Chain',
    shape: 'Plucked Link from a Spiked Chain',
    chosenBy: 'Kayzoku (God of Law, Chance & Games)',
    rateToGp: 1.0,
    weightGrams: 14.2,
    purity: '91.6% Sun-Gold Alloy',
    mintMark: 'The Passing Die // Kai Lands & Hayde Mint',
    description: 'Plucked from Kayzoku\'s own spiked chain. Rogues and gamblers carry a lucky link as a holy talisman, swearing it can break open any lock or bend odds in high-stakes dice halls.',
    badgeColor: '#ffd700',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_2.png',
    obverseNotes: 'Heavy spiked chain outer link with dual interlock teeth and the laughing mask of Kayzoku.',
    reverseNotes: 'Staggered tally marks denoting the 9 liturgical days of the Konran week.',
  },
  {
    id: 'electrum-orchid',
    name: 'Electrum Orchid (EP)',
    alias: 'The Nonagon Orchid',
    shape: 'Nine-Petaled Orchid with Punched Nonagon',
    chosenBy: 'Ay / Ayan (God/dess of Fate & Destiny)',
    rateToGp: 0.5,
    weightGrams: 11.8,
    purity: '50% Gold, 50% Silver Electrum',
    mintMark: 'Ayan Subterranean Core Mint // The Weave',
    description: 'Opted for cosmic balance and fate. Stamped into a delicate 9-petaled orchid with a chiseled nonagon punched through the exact center to balance solar and lunar weight.',
    badgeColor: '#a7f3d0',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_3.png',
    obverseNotes: 'Nine petal facets radiating outward with micro-inscribed fate coordinates.',
    reverseNotes: 'Polished inner nonagon bevel and the thread-spool mark of the Fate Weaver.',
  },
  {
    id: 'silver-rose',
    name: 'Silver Rose (SP)',
    alias: 'The Dark Rose ("Slip me a Nip")',
    shape: 'Bloomed Rose ("Slip me a Nip")',
    chosenBy: 'Slavyna (Succubus Queen of Demons & Society)',
    rateToGp: 0.1,
    weightGrams: 9.6,
    purity: '92.5% Sterling Moon-Silver',
    mintMark: 'UnderCrust High Spire Mint // Syndavaria',
    description: 'Pressed in the delicate shape of a blooming velvet rose. Across every tavern, pleasure district, and undercrust den, payment is requested with the universal phrase: "Slip me a Nip".',
    badgeColor: '#cbd5e1',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_4.png',
    obverseNotes: 'Petal-layered high-relief rose bloom with sapphire luster highlights.',
    reverseNotes: 'Intertwined bladed thorns forming the secret cipher of the Spyder Systerhood.',
  },
  {
    id: 'copper-book-corner',
    name: 'Copper Book-Corner (CP)',
    alias: 'The Scholar\'s Corner',
    shape: 'Triangular (Corner of a Bound Book)',
    chosenBy: 'Lyricia (Goddess of Knowledge & Commerce)',
    rateToGp: 0.01,
    weightGrams: 8.1,
    purity: '98% Refined Zormite Copper',
    mintMark: 'Divine Treasury // Lona Uyn & Othenaeum',
    description: 'Triangular copper token shaped like the protective corner clasp of an ancient tome. Stamped with the crescent of The Lyrisphere moon and the sacred scroll of knowledge.',
    badgeColor: '#d97706',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_5.png',
    obverseNotes: 'Triangular book corner with embossed scroll and Lyrisphere moon glyph.',
    reverseNotes: 'Double-ruled border with micro-runic graduation marks for rapid tallying.',
  },
  {
    id: 'obsydian-promissory-shard',
    name: 'ObsydianHeart Promissory Matrix',
    alias: 'The DepthSpire Scrip',
    shape: 'Faceted Voidglass Matrix Ingot',
    chosenBy: 'ObsydianHeart Commercial Corp',
    rateToGp: 50.0,
    weightGrams: 5.0,
    purity: 'Bio-Grafted Voidglass / Leyline Matrix',
    mintMark: 'BlackHeart DepthSpire Commercial Foundry',
    description: 'A luminous violet-edged crystal promissory note accepted for 1-Click Stargate deliveries, black-market augments, and high-tier airship charters.',
    badgeColor: '#d946ef',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_6.png',
    obverseNotes: 'Crystal matrix etched with quantum telemetry ticks and Stargate routing codes.',
    reverseNotes: 'Sub-surface bio-luminescent security seal preventing illicit alchemical duplication.',
  },
  {
    id: 'kelth-hayde-sovereign',
    name: 'Kelth Hayde Gold Sovereign',
    alias: 'The Sun-Disc Sovereign',
    shape: 'Concentric Ring Sun-Disc',
    chosenBy: 'Hayde Genies & Golden Moon Mint',
    rateToGp: 5.0,
    weightGrams: 22.0,
    purity: '99.9% Kelthian Sun-Gold',
    mintMark: 'Golden Moon of Kelth // Grand Treasury',
    description: 'The ancient inter-planar bullion standard. Forged by the Hayde Genies of Kelth, featuring dual concentric planetary rings and perfect balance.',
    badgeColor: '#f59e0b',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_7.png',
    obverseNotes: 'Solar flare corona circling the double concentric ring planetary alignment.',
    reverseNotes: 'Genie seal of conservation ensuring zero shaving or weight degradation.',
  },
  {
    id: 'ousavan-pearl-shilling',
    name: 'Ousavan Reef Shilling',
    alias: 'The Coral Shilling',
    shape: 'Organic Scalloped Shell Disque',
    chosenBy: 'Ousava (The Life Giver & Elements)',
    rateToGp: 2.0,
    weightGrams: 16.5,
    purity: 'Electrum-Pearl Composite Alloy',
    mintMark: 'Vaya Mar & Cecaelia High Elders',
    description: 'Impervious to ocean saltwater corrosion and crushing depths. Stamped in glowing kraken ink and used by elite maritime cartels.',
    badgeColor: '#38bdf8',
    specimenImage: '/assets/konran/currency/fantasy_video_game_prop_concept_art_render_isolated_on_dark_velvet_black_8.png',
    obverseNotes: 'Spiral nautilus geometry radiating with marine bio-luminescence.',
    reverseNotes: 'Kelp leaf sigil with tidal depth certification stamps.',
  },
];

export const CoinPurseEconomyView: React.FC = () => {
  const { activeCharacter } = useCharacter();
  const [activeTab, setActiveTab] = useState<'catalog' | 'exchange'>('catalog');
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string>('platinum-lute-pick');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Exchange calculator states
  const [exchangeFrom, setExchangeFrom] = useState<string>('gold-spiked-link');
  const [exchangeTo, setExchangeTo] = useState<string>('silver-rose');
  const [amount, setAmount] = useState<number>(10);
  const [notice, setNotice] = useState<string>('');

  const selectedSpecimen = CANON_SPECIMENS.find(s => s.id === selectedSpecimenId) || CANON_SPECIMENS[0];

  const handleConvert = () => {
    playDivineReveal();
    const from = CANON_SPECIMENS.find(d => d.id === exchangeFrom)!;
    const to = CANON_SPECIMENS.find(d => d.id === exchangeTo)!;
    const totalGp = amount * from.rateToGp;
    const received = Math.floor((totalGp / to.rateToGp) * 100) / 100;

    setNotice(`MINT EXCHANGE COMPLETE // Converted ${amount} ${from.name} into ~${received} ${to.name} via Lyricia Divine Treasury`);
    setTimeout(() => setNotice(''), 4500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e14] text-white font-mono text-xs overflow-hidden select-text">
      {/* Top Header / Mode Switcher */}
      <div className="p-3 bg-[#0f1420] border-b border-[#c5a059]/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <Landmark className="w-5 h-5 text-[#c5a059]" />
          <div>
            <h2 className="font-bold text-[#c5a059] uppercase tracking-wider text-sm flex items-center gap-2">
              <span>The Divine Treasury // Numismatic Specimen Catalog</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#c5a059]/20 border border-[#c5a059] text-[#c5a059] font-bold">
                CANON CURRENCY
              </span>
            </h2>
            <p className="text-[10px] text-white/50">
              Curated Imperial Vault • Lyricia Divine Mint &amp; Sacred Geometry Currency of The Nyne
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playKeyClick();
              setActiveTab('catalog');
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-[#c5a059]/20 border border-[#c5a059] text-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Specimen Loupe (8 Artifacts)</span>
          </button>

          <button
            onClick={() => {
              playKeyClick();
              setActiveTab('exchange');
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exchange'
                ? 'bg-[#c5a059]/20 border border-[#c5a059] text-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Mint Exchange Calculator</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-2.5 bg-[#39ff14]/20 border-b border-[#39ff14] text-[#39ff14] text-center text-xs font-bold animate-fadeIn shrink-0">
          {notice}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            {/* Left Column: Specimen Selection Tray (4 cols) */}
            <div className="lg:col-span-4 space-y-2 overflow-y-auto max-h-[620px] pr-1">
              <div className="text-[10px] text-[#c5a059] uppercase font-bold tracking-widest px-1 pb-1 border-b border-white/10 flex items-center justify-between">
                <span>Vault Specimens</span>
                <span className="text-white/40">{CANON_SPECIMENS.length} Registered</span>
              </div>

              <div className="space-y-1.5">
                {CANON_SPECIMENS.map((coin) => {
                  const isSelected = selectedSpecimenId === coin.id;
                  return (
                    <button
                      key={coin.id}
                      onClick={() => {
                        playOptionSelect();
                        setSelectedSpecimenId(coin.id);
                      }}
                      className={`w-full p-2.5 rounded text-left border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#c5a059] bg-[#1a2238] shadow-[0_0_15px_rgba(197,160,89,0.25)]'
                          : 'border-white/10 bg-black/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: coin.badgeColor }}
                        />
                        <div className="truncate">
                          <div className="font-bold text-white text-xs truncate">
                            {coin.name}
                          </div>
                          <div className="text-[10px] text-white/50 truncate">
                            {coin.chosenBy}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#c5a059] font-bold font-mono shrink-0 ml-1">
                        {coin.rateToGp} GP
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Specimen Macro Examination Loupe (8 cols) */}
            <div className="lg:col-span-8 p-4 rounded bg-[#10141f] border border-[#c5a059]/30 space-y-4 flex flex-col justify-between">
              {/* Header and Numismatic Provenance */}
              <div>
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedSpecimen.badgeColor }}
                      />
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {selectedSpecimen.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black border border-white/20 text-[#c5a059]">
                        {selectedSpecimen.alias}
                      </span>
                    </div>
                    <p className="text-xs text-[#c5a059] mt-0.5 font-sans">
                      Patron Authority: <strong>{selectedSpecimen.chosenBy}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-white/20 hover:border-[#c5a059] text-white/80 hover:text-white text-[10px] cursor-pointer transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>{isZoomed ? 'Reset Scale' : 'Inspect Loupe'}</span>
                  </button>
                </div>

                {/* Macro Render Display on Dark Velvet Black */}
                <div className="mt-3 relative rounded border border-white/15 overflow-hidden bg-black/90 p-3 flex items-center justify-center min-h-[260px] shadow-inner group">
                  <img
                    src={selectedSpecimen.specimenImage}
                    alt={selectedSpecimen.name}
                    className={`max-h-[240px] w-auto object-contain transition-transform duration-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] ${
                      isZoomed ? 'scale-130' : 'group-hover:scale-105'
                    }`}
                  />
                  <span className="absolute bottom-2 right-2 text-[9px] font-mono text-white/40 bg-black/70 px-2 py-0.5 rounded">
                    Obverse &amp; Reverse Studio Macro
                  </span>
                </div>

                {/* Numismatic Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                  <div className="p-2 rounded bg-black/50 border border-white/10 space-y-0.5">
                    <span className="text-[9px] text-white/40 uppercase font-bold block">Physical Shape</span>
                    <span className="text-[11px] text-[#39ff14] font-bold truncate block">{selectedSpecimen.shape}</span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-white/10 space-y-0.5">
                    <span className="text-[9px] text-white/40 uppercase font-bold block">Fine Weight</span>
                    <span className="text-[11px] text-white font-bold block">{selectedSpecimen.weightGrams}g</span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-white/10 space-y-0.5">
                    <span className="text-[9px] text-white/40 uppercase font-bold block">Assayed Purity</span>
                    <span className="text-[11px] text-[#ffd700] font-bold truncate block">{selectedSpecimen.purity}</span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-white/10 space-y-0.5">
                    <span className="text-[9px] text-white/40 uppercase font-bold block">Standard Value</span>
                    <span className="text-[11px] text-[#c5a059] font-bold block">{selectedSpecimen.rateToGp} GP Equivalent</span>
                  </div>
                </div>

                {/* Lore and Details */}
                <div className="mt-3 p-3 rounded bg-black/40 border border-white/10 space-y-2">
                  <div>
                    <span className="text-[10px] text-[#c5a059] uppercase font-bold tracking-wider block">
                      Imperial Mint Origin &amp; Mark:
                    </span>
                    <p className="text-xs text-white/80">{selectedSpecimen.mintMark}</p>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    {selectedSpecimen.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10.5px]">
                    <div>
                      <strong className="text-[#39ff14]">Obverse Details:</strong>{' '}
                      <span className="text-white/70">{selectedSpecimen.obverseNotes}</span>
                    </div>
                    <div>
                      <strong className="text-[#c5a059]">Reverse Details:</strong>{' '}
                      <span className="text-white/70">{selectedSpecimen.reverseNotes}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action: Test Convert */}
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    setExchangeFrom(selectedSpecimen.id);
                    setActiveTab('exchange');
                  }}
                  className="px-4 py-2 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 border border-[#c5a059] text-[#c5a059] font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Trade Specimen in Mint Exchange</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MINT EXCHANGE CALCULATOR */}
        {activeTab === 'exchange' && (
          <div className="max-w-2xl mx-auto p-5 rounded bg-[#10141f] border border-[#c5a059]/40 space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#c5a059] uppercase tracking-wider border-b border-white/10 pb-3">
              <Scale className="w-4 h-4" />
              <span>Lyricia Divine Treasury // Real-Time Mint Calculator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-white/60 mb-1 text-[10px] uppercase font-bold">
                  Amount of Coin
                </label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#c5a059] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 text-[10px] uppercase font-bold">
                  From Denomination
                </label>
                <select
                  value={exchangeFrom}
                  onChange={(e) => setExchangeFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#c5a059] text-xs font-mono"
                >
                  {CANON_SPECIMENS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.rateToGp} GP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1 text-[10px] uppercase font-bold">
                  To Denomination
                </label>
                <select
                  value={exchangeTo}
                  onChange={(e) => setExchangeTo(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#c5a059] text-xs font-mono"
                >
                  {CANON_SPECIMENS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.rateToGp} GP)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-black/50 rounded border border-white/10 text-center font-sans space-y-1">
              <span className="text-[11px] text-white/60 block">Exchange Estimate:</span>
              <div className="text-lg font-bold text-[#c5a059] font-mono">
                {amount} {CANON_SPECIMENS.find(d => d.id === exchangeFrom)?.name} ={' '}
                {Math.floor(((amount * (CANON_SPECIMENS.find(d => d.id === exchangeFrom)?.rateToGp || 1)) / (CANON_SPECIMENS.find(d => d.id === exchangeTo)?.rateToGp || 1)) * 100) / 100}{' '}
                {CANON_SPECIMENS.find(d => d.id === exchangeTo)?.name}
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full py-3 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 border-2 border-[#c5a059] text-[#c5a059] font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-[0_0_20px_rgba(197,160,89,0.25)]"
            >
              <Coins className="w-4 h-4" />
              <span>Certify Mint Weight &amp; Confirm Conversion</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
