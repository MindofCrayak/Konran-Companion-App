import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  History, 
  MessageSquareQuote, 
  Search, 
  Eye, 
  Lock, 
  Volume2, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  Filter, 
  Orbit, 
  Scale, 
  Crown,
  BookOpen,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { KONRAN_WORLD_LORE, LoreSection } from '../data/worldLore';
import { KONRAN_GLOSSARY_ENTRIES, GlossaryEntry } from '../data/glossaryData';
import { playKeyClick, playOptionSelect } from '../utils/audio';

type LoreTab = 'map' | 'realms' | 'laws' | 'races' | 'glossary' | 'what-do-i-know';

const REALMS_DATA = [
  {
    id: 'ayan',
    name: 'Ayan (The Sun)',
    ruler: 'Ay (They Who Foreknow)',
    type: 'Subterranean Core World / Central Star',
    desc: 'The dying star around which the 9 worlds orbit. Deep subterranean cities weave the threads of fate.',
    image: '/assets/konran/realms/ayan_the_sun.jpg'
  },
  {
    id: 'lona-uyn',
    name: 'Lona Uyn',
    ruler: 'Lyricia (The Wisest)',
    type: 'Crystal Nomadic Subterranean World',
    desc: 'Wandering subterranean crystal libraries and high universities. Mints the divine currency for all realms.',
    image: '/assets/konran/realms/lona_uyn_lyricia.jpg'
  },
  {
    id: 'kay-kee',
    name: 'Kay & Kee',
    ruler: 'Kayzoku (The Trickster)',
    type: 'Twin Dual Worlds (Kay = Chaos, Kee = Order)',
    desc: 'Two binary worlds that experience the annual "Kay\'s Passing" jump, swapping gravitational balances.',
    image: '/assets/konran/realms/kay_kee_kayzoku.jpg'
  },
  {
    id: 'synthelavor',
    name: 'Synthelavor',
    ruler: 'Slavyna (Succubus Queen of Demons)',
    type: 'Nyne Hells / Labyrinth of Steam',
    desc: 'Pink steaming sulfuric seas, intricate dark pleasure labyrinths, and high court politics of the UnderCrust.',
    image: '/assets/konran/realms/synthelavor_slavyna.jpg'
  },
  {
    id: 'konran',
    name: 'Konran (The Capital World)',
    ruler: 'Shared Dominion of The Nyne',
    type: '10th Plane / The Youngest World',
    desc: 'Forged jointly by The Nyne as an interconnected high-fantasy magitek frontier. Home to 1.6 Billion sentient beings.',
    image: '/assets/konran/maps/konran_world_map_labeled.jpg'
  },
  {
    id: 'cadence',
    name: 'Cadence',
    ruler: 'Celeste (Maestro of Might)',
    type: 'Elemental Plane of Earth / Fortress World',
    desc: 'Chiseled mountain citadels, gladiatorial amphitheatres, and the training grounds of the Sororal Army.',
    image: '/assets/konran/realms/cadence_celeste.jpg'
  },
  {
    id: 'dyata',
    name: 'Dyata',
    ruler: 'Oray (God of Dragons & Magic)',
    type: 'The Crumbling World / Magical Superstorm',
    desc: 'Floating volcanic continents suspended in endless arcane tempest lightning. Dragon roosts and spellcraft forges.',
    image: '/assets/konran/realms/dyata_oray.jpg'
  },
  {
    id: 'vaya-marr',
    name: 'Vaya Marr',
    ruler: 'Ousava (The Life Giver)',
    type: 'Ocean World / Sacred Kelp Groves',
    desc: 'Severe wet and dry cycles. Linked by "Lantyca\'s Kiss" periapsis water-torrent linking moon and ocean floor.',
    image: '/assets/konran/realms/vaya_mar_ousava.jpg'
  },
  {
    id: 'duathyer',
    name: 'Duathyer',
    ruler: 'Psyon (The Mad God)',
    type: 'Shrouded Silver Mist / Shifting Reality',
    desc: 'Enveloped in impenetrable silver clouds and chaotic dreamscapes. Known to cartographers as impossible to map.',
    image: '/assets/konran/realms/duathyer_psyon.jpg'
  },
  {
    id: 'kestok',
    name: 'Kestok',
    ruler: 'Krayvuk (The All-Seeing)',
    type: 'Bisected Craterous World / Trench Empire',
    desc: 'Deep planetary rift cities, obsidian observatories, and advanced NecroTek chrono-engines.',
    image: '/assets/konran/realms/kestox_krayvuk.jpg'
  }
];

const CHOSEN_RACES_LORE = [
  { race: 'Cecaelia', deity: 'Ousava', title: 'The Maiden, Mother & Mystic', realm: 'Vaya Mar', prov: 'Sava Province', desc: 'Gentle, kind cephalopod folk and reef elementalists cultivating sacred kelp.' },
  { race: 'FlameForged', deity: 'Oray', title: 'Master of Magic & Dragons', realm: 'Dyata', prov: 'Oray Nation', desc: 'Living draconic fire and volcanic crystal-infused smiths and transmuters.' },
  { race: 'Wyse Elves', deity: 'Lyricia', title: 'Her Wysest / Commerce', realm: 'Lona Uyn', prov: 'Cia Providence', desc: 'Victorian-attired scholarly elves accompanied by Skryllion otters.' },
  { race: 'Ceall', deity: 'Celeste', title: 'Maestro of Might', realm: 'Cadence', prov: 'Leste Province', desc: 'Proud martial guardians and sororal warriors upholding the Stone Enclave.' },
  { race: 'Kytans', deity: 'Kayzoku', title: 'The Unpredictable Trickster', realm: 'Kay & Kee', prov: 'Kai Lands', desc: 'Acrobatic monks, game masters, and daring thieves carrying spiked gold links.' },
  { race: 'Fortuna', deity: 'Ay(an)', title: 'The Fate Weaver', realm: 'Ayan', prov: 'Polar Lands', desc: 'Ethereal beings who foreknow timelines and hold the celestial lottery.' },
  { race: 'InkBorne', deity: 'Psyon', title: 'The Mad God', realm: 'Duathyer', prov: 'Patchwork Isles', desc: 'Fluid reality shapers carrying living ink from the unraveled mind.' },
  { race: 'Skree', deity: 'Krayvuk', title: 'The All-Seeing', realm: 'Kestok', prov: 'Kray Province', desc: 'Deep-trench observers masters of NecroTek, space, time, and gravity.' },
  { race: 'Apex', deity: 'Slavyna', title: 'The Dark Madame', realm: 'Synthelavor', prov: 'UnderCrust', desc: 'Demon-blooded masters of passion, secrets, and high underground society.' }
];

export const LivingLoreEngineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LoreTab>('map');
  const [mapMode, setMapMode] = useState<'labeled' | 'clean' | 'kray'>('labeled');
  const [searchQuery, setSearchQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('all');
  const [selectedRealm, setSelectedRealm] = useState(REALMS_DATA[4]); // default Konran

  // "What Do I Know?" Engine Filtering
  const filteredWorldLore = useMemo(() => {
    return KONRAN_WORLD_LORE.filter((entry: LoreSection) => {
      const q = searchQuery.toLowerCase();
      return entry.title.toLowerCase().includes(q) ||
        entry.subtitle.toLowerCase().includes(q) ||
        entry.summary.toLowerCase().includes(q);
    });
  }, [searchQuery]);

  // Glossary Entries Filtering
  const filteredGlossary = useMemo(() => {
    return KONRAN_GLOSSARY_ENTRIES.filter((entry: GlossaryEntry) => {
      const matchCat = glossaryCategory === 'all' || entry.category === glossaryCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery.trim() ||
        entry.title.toLowerCase().includes(q) ||
        (entry.subtitle && entry.subtitle.toLowerCase().includes(q)) ||
        entry.tags.some(t => t.toLowerCase().includes(q)) ||
        entry.content.toLowerCase().includes(q) ||
        (entry.dcChecks && entry.dcChecks.some(dc => dc.check.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });
  }, [glossaryCategory, searchQuery]);

  return (
    <div className="w-full h-full flex flex-col bg-[#050b07] text-white font-mono text-xs overflow-hidden select-text">
      {/* Top Tab Bar */}
      <div className="p-3 bg-black/80 border-b border-[#39ff14]/30 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#39ff14] animate-spin" style={{ animationDuration: '30s' }} />
          <h2 className="font-bold text-[#39ff14] uppercase tracking-wider text-sm">
            Living Lore &amp; Planetary Archive
          </h2>
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { id: 'map', label: 'World Map & Gazetteer', icon: MapPin },
            { id: 'realms', label: 'The 9 Planes & The Ages', icon: Orbit },
            { id: 'laws', label: 'Prime Law & Calendar', icon: Scale },
            { id: 'races', label: 'The Chosen Races', icon: Crown },
            { id: 'glossary', label: 'Konran Glossary (GDocs)', icon: BookOpen },
            { id: 'what-do-i-know', label: 'What Do I Know?', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playKeyClick();
                  setActiveTab(tab.id as LoreTab);
                }}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] font-bold shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: WORLD MAP & GAZETTEER */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                  View Layer:
                </span>
                <button
                  onClick={() => setMapMode('labeled')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    mapMode === 'labeled' ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Labeled Continents &amp; Nations
                </button>
                <button
                  onClick={() => setMapMode('clean')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    mapMode === 'clean' ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Clean Cartography
                </button>
                <button
                  onClick={() => setMapMode('kray')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    mapMode === 'kray' ? 'bg-[#ffd700]/20 border-[#ffd700] text-[#ffd700]' : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Kray Providence Detail Map
                </button>
              </div>
              <span className="text-[10px] text-white/50">
                11,128 Years of History • 7 Continents • 11 Major Cities
              </span>
            </div>

            {/* Map Display Frame */}
            <div className="relative rounded border border-white/20 overflow-hidden bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.9)] max-h-[550px] flex items-center justify-center">
              <img
                src={
                  mapMode === 'labeled'
                    ? '/assets/konran/maps/konran_world_map_labeled.jpg'
                    : mapMode === 'clean'
                    ? '/assets/konran/maps/konran_world_map_clean.jpg'
                    : '/assets/konran/maps/kray_map_detail.jpg'
                }
                alt="Konran World Map"
                className="w-full h-auto max-h-[520px] object-contain"
              />
            </div>

            {/* Provinces Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
              {[
                { name: 'Cia Providence', patron: 'Lyricia', desc: 'Scholarly cities, crystal libraries, and Lake Knowledge.' },
                { name: 'Sava Providence', patron: 'Ousava', desc: 'Verdant jungles, sea inlets, and coral kelp temples.' },
                { name: 'Leste Providence', patron: 'Celeste', desc: 'Gladiator arenas, marble quarries, and mountain bastions.' },
                { name: 'Kray Providence', patron: 'Krayvuk', desc: 'Capital Crafton Cove, Mount Kraykaly, and The Expanze.' },
                { name: 'Oray Nation', patron: 'Oray', desc: 'Volcanic calderas, dragon watchtowers, and fire magic.' },
                { name: 'Kai Lands', patron: 'Kayzoku', desc: 'Whirling ocean vortexes, chaotic monasteries, and gambling dens.' },
                { name: 'Patchwork Isles', patron: 'Psyon', desc: 'Shifting archipelago where laws of physics unravel.' },
                { name: 'Vantya (World Center)', patron: 'The Nyne', desc: 'Floating nexus connecting the Leylines of all providences.' },
              ].map((p) => (
                <div key={p.name} className="p-2.5 rounded bg-black/40 border border-white/10 space-y-1">
                  <div className="font-bold text-[#ffd700] text-xs">{p.name}</div>
                  <div className="text-[10px] text-[#39ff14]">Patron: {p.patron}</div>
                  <p className="text-[10px] text-white/60 font-sans">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: THE 9 PLANES & THE AGES */}
        {activeTab === 'realms' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: The Planes & The Ages Diagram */}
              <div className="lg:col-span-1 p-3 rounded bg-black/60 border border-white/15 space-y-2 flex flex-col items-center">
                <span className="text-xs text-[#ffd700] font-bold uppercase tracking-wider">
                  The Astrolabe Alignment &amp; The Ages
                </span>
                <img
                  src="/assets/konran/realms/the_planes_and_ages.jpg"
                  alt="The Planes & The Ages"
                  className="w-full max-w-[280px] rounded border border-white/10 shadow-lg"
                />
                <p className="text-[10px] text-white/60 text-center font-sans">
                  The Nine celestial worlds orbiting the dying star Ayan, with Konran (the capital) created in the center.
                </p>
              </div>

              {/* Right Column: Interactive Planes List */}
              <div className="lg:col-span-2 space-y-3">
                <div className="text-xs text-[#39ff14] font-bold uppercase tracking-widest">
                  Planetary Profiles of The Konra System:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REALMS_DATA.map((realm) => (
                    <div
                      key={realm.id}
                      onClick={() => setSelectedRealm(realm)}
                      className={`p-3 rounded border text-left cursor-pointer transition-all ${
                        selectedRealm.id === realm.id
                          ? 'border-[#39ff14] bg-[#39ff14]/15 shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-white text-xs">{realm.name}</div>
                      <div className="text-[10px] text-[#ffd700]">{realm.ruler}</div>
                      <div className="text-[9.5px] text-white/50 italic mb-1">{realm.type}</div>
                      <p className="text-[10.5px] text-white/70 font-sans leading-relaxed">{realm.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRIME LAW & CALENDAR */}
        {activeTab === 'laws' && (
          <div className="space-y-4">
            {/* The Prime Law Callout */}
            <div className="p-4 rounded bg-gradient-to-r from-red-950/40 via-black to-red-950/40 border-2 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.25)] space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-xs">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>The Sacred Prime Law of Konran</span>
              </div>
              <blockquote className="text-sm font-bold text-white italic border-l-2 border-red-500 pl-3 py-1">
                "Do not hunt, harm, maim or murder any sentient beings for pleasure, profit or ownership."
              </blockquote>
              <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                Upheld by the Sororal Army trained by Celeste and the local 'Peace Officers' in all cities. Sentience is inviolable under the joint covenants of The Nyne.
              </p>
            </div>

            {/* Calendar & Planetary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-widest block">
                  The Liturgical Year (324 Days)
                </span>
                <p className="text-xs text-white/90">
                  <strong>9 Months</strong> per year, exactly <strong>36 days</strong> per month, divided into <strong>9-day weeks</strong>.
                </p>
                <p className="text-[10px] text-white/60 font-sans">
                  Current Era: <strong>2,483rd year of the 3rd Age</strong> ("The Era of Magic").
                </p>
              </div>

              <div className="p-3 rounded bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-[10px] text-[#39ff14] uppercase font-bold tracking-widest block">
                  The 36-Hour Planetary Day
                </span>
                <p className="text-xs text-white/90">
                  <strong>18 Hours of Day</strong> and <strong>18 Hours of Night</strong>.
                </p>
                <p className="text-[10px] text-white/60 font-sans">
                  Grants sentient beings expanded time for scholarship, arcane research, and leisure without relentless industrial fatigue.
                </p>
              </div>

              <div className="p-3 rounded bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-[10px] text-[#c49cff] uppercase font-bold tracking-widest block">
                  Moons &amp; Planetary Scale
                </span>
                <p className="text-xs text-white/90">
                  <strong>2 Moons:</strong> The Lyrisphere (amber) and Ayanath (violet).
                </p>
                <p className="text-[10px] text-white/60 font-sans">
                  Population: <strong>1.6 Billion Sentient Beings</strong> across 7 continents and 11 sprawling metropolises.
                </p>
              </div>
            </div>

            {/* The Fall Event Lore */}
            <div className="p-4 rounded bg-purple-950/20 border border-purple-500/40 space-y-2">
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider block">
                The Cataclysm // 'The Fall'
              </span>
              <p className="text-[11px] text-white/80 leading-relaxed font-sans">
                An apocalyptic dimensional rupture where the skies above Konran ripped open, and the scattered ruins and cities of Earth crashed into the world like magical marbles. 18 modern Earth cities were deposited across the landscape, giving rise to an industrial revolution mixing crystal spell engines, NecroTek, and contemporary electronics with high arcane magic.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: THE CHOSEN RACES */}
        {activeTab === 'races' && (
          <div className="space-y-4">
            <div className="text-xs text-white/70">
              Each of The Nyne holds an original chosen race whose physiology, ethos, and culture reflect their divine patron:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CHOSEN_RACES_LORE.map((r) => (
                <div
                  key={r.race}
                  className="p-3 rounded bg-black/50 border border-white/10 hover:border-[#ffd700]/50 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{r.race}</span>
                    <span className="text-[10px] text-[#ffd700] font-bold">{r.deity}</span>
                  </div>
                  <div className="text-[10px] text-[#39ff14]">{r.prov}</div>
                  <div className="text-[9.5px] text-white/50 italic">{r.realm}</div>
                  <p className="text-[10.5px] text-white/70 font-sans leading-relaxed mt-1">
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: THE KONRAN GLOSSARY (Extracted directly from Google Docs) */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            {/* Search and Category Filter Bar */}
            <div className="p-3 bg-black/60 rounded border border-[#39ff14]/30 space-y-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#39ff14]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search canonical glossary terms, demigods, planes, DC checks..."
                  className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-white/40 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
                {[
                  { id: 'all', label: 'All Entries' },
                  { id: 'introduction', label: 'Player Intro & Prime Law' },
                  { id: 'planes', label: 'The 9 Planes & Moons' },
                  { id: 'deities', label: 'Deities & Portfolios' },
                  { id: 'demigods', label: 'Demigods & Offspring' },
                  { id: 'sects', label: 'Religious Sects & Links' },
                  { id: 'titles', label: 'Dyvine Council & Titles' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playKeyClick();
                      setGlossaryCategory(cat.id);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      glossaryCategory === cat.id
                        ? 'bg-[#39ff14] text-black font-bold'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glossary Entries Grid */}
            <div className="space-y-3">
              {filteredGlossary.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded bg-[#0a120c] border border-white/15 space-y-2 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#ffd700] tracking-wide">
                        {entry.title}
                      </h4>
                      {entry.subtitle && (
                        <p className="text-[10.5px] text-[#39ff14] font-sans">
                          {entry.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-black/60 border border-white/20 text-white/60 font-mono uppercase">
                      Category: {entry.category}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed font-sans whitespace-pre-line">
                    {entry.content}
                  </p>

                  {/* DC Knowledge Checks if present */}
                  {entry.dcChecks && entry.dcChecks.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <span className="text-[10px] text-[#ffcc00] uppercase font-bold tracking-wider block">
                        Canonical Knowledge DC Checks:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entry.dcChecks.map((dc) => (
                          <div
                            key={dc.dc}
                            className="p-2 rounded bg-black/60 border border-white/10 flex items-start gap-2"
                          >
                            <span className="px-1.5 py-0.5 rounded bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] font-bold text-[9px] shrink-0 font-mono">
                              DC {dc.dc}
                            </span>
                            <span className="text-[10.5px] text-white/70 font-sans leading-tight">
                              {dc.check}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-white/40 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: WHAT DO I KNOW? */}
        {activeTab === 'what-do-i-know' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded bg-black border border-white/20">
              <Search className="w-4 h-4 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search world lore, factions, ruins, or leyline anomalies..."
                className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              {filteredWorldLore.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded bg-black/40 border border-white/10 space-y-1"
                >
                  <div className="font-bold text-[#39ff14] text-xs">{item.title}</div>
                  <div className="text-[10px] text-white/50">{item.subtitle}</div>
                  <p className="text-[11px] text-white/80 font-sans leading-relaxed">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
