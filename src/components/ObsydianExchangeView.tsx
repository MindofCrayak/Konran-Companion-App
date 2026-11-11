import React, { useState, useEffect } from 'react';
import {
  Orbit,
  TrendingUp,
  Coins,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Zap,
  AlertTriangle,
  Flame,
  Eye,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';

interface CrystalCatalogItem {
  id: string;
  name: string;
  category: 'Skeksis Essence' | 'Goa\'uld Control Crystal' | 'Frankenstein Bio-Graft' | 'Prime Relic';
  priceGp: number;
  originalGp: number;
  rating: string;
  reviews: number;
  primeDelivery: string;
  gemSprite: string;
  tagline: string;
  dnd55eEffect: string;
  sideEffectWarning: string;
  inStock: number;
}

const CRYSTAL_CATALOG: CrystalCatalogItem[] = [
  {
    id: 'oh-skeksis-vial',
    name: 'Drained Skeksis Youth Essence (Triple-Distilled)',
    category: 'Skeksis Essence',
    priceGp: 185,
    originalGp: 320,
    rating: '4.9 ★',
    reviews: 1420,
    primeDelivery: 'SAME-CYCLE AETHER DRONE DROP',
    gemSprite: '/assets/konran/stones/fronts/lens_1_0.png',
    tagline: 'Why age like a mortal when you can drink raw Dark Crystal resonance?',
    dnd55eEffect: 'Gain 2d8 + 4 Temporary HP and Advantage on Charisma checks for 8 hours.',
    sideEffectWarning: '12% chance of temporary purple crystal-vein luminescence and involuntary cackling.',
    inStock: 3,
  },
  {
    id: 'oh-goauld-rod',
    name: 'Goa\'uld Pel\'tak Control Crystal Shard (Amber Grade)',
    category: 'Goa\'uld Control Crystal',
    priceGp: 420,
    originalGp: 600,
    rating: '4.8 ★',
    reviews: 892,
    primeDelivery: 'STARGATE RING TRANSPORTER READY',
    gemSprite: '/assets/konran/stones/fronts/lens_1_1.png',
    tagline: 'Slot directly into your Slablet or arcane focus—command ship doors, constructs, and lesser minds!',
    dnd55eEffect: '+1 to Spell Attack Rolls & DC; cast Command or Knock once per Long Rest without a spell slot.',
    sideEffectWarning: 'Voice may boom with dual-harmonic metallic reverb during high stress.',
    inStock: 5,
  },
  {
    id: 'oh-franken-coil',
    name: 'Dr. Viktor\'s Galvanic Re-Animator Spine Clamp',
    category: 'Frankenstein Bio-Graft',
    priceGp: 290,
    originalGp: 450,
    rating: '4.7 ★',
    reviews: 643,
    primeDelivery: 'IGOR EXPRESS COURIER (FREE WITH OH-PRIME)',
    gemSprite: '/assets/konran/stones/fronts/sphere_3.png',
    tagline: '"IT\'S ALIVE!" — Never let a little thing like 0 HP slow down your adventuring party!',
    dnd55eEffect: 'When reduced to 0 HP, a 10,000-volt crystal capacitor fires: drop to 1 HP instead and deal 2d6 Lightning damage to adjacent foes (1/Long Rest).',
    sideEffectWarning: 'Neck-bolt electrodes attract stray static and inquisitive Spynx lab techs.',
    inStock: 2,
  },
  {
    id: 'oh-nostromo-bioscan',
    name: 'MU-TH-UR 6000 Xenomorph Bio-Pulse Auspex',
    category: 'Prime Relic',
    priceGp: 240,
    originalGp: 350,
    rating: '5.0 ★',
    reviews: 2105,
    primeDelivery: 'INSTANT TELEMETRY DOWNLOAD',
    gemSprite: '/assets/konran/stones/fronts/sphere_0.png',
    tagline: 'Detects micro-acidic blood signatures, mimic heartbeats, and void-parasites through 4 feet of lead!',
    dnd55eEffect: 'Bonus Action ping: detect invisible, hidden, or shapeshifted creatures within 30 ft. until end of turn (Proficiency Bonus/day).',
    sideEffectWarning: 'Emits escalating high-pitched motion-tracker pings when DM smiles.',
    inStock: 7,
  },
  {
    id: 'oh-sarcophagus-lease',
    name: 'Portable Golden Sarcophagus Sleep-Pod (7-Day Lease)',
    category: 'Goa\'uld Control Crystal',
    priceGp: 550,
    originalGp: 999,
    rating: '4.9 ★',
    reviews: 512,
    primeDelivery: 'HEAVY CARGO RING-DOWN',
    gemSprite: '/assets/konran/stones/fronts/oray.png',
    tagline: 'Complete Long Rests in 2 hours inside solid gold Stargate-grade cellular regeneration plating!',
    dnd55eEffect: 'Removes 2 levels of Exhaustion and all non-cursed diseases on a Long Rest.',
    sideEffectWarning: 'Prolonged use may cause mild megalomania and urge to demand tribute from villagers.',
    inStock: 1,
  },
  {
    id: 'oh-garthim-carapace',
    name: 'Chitinous Garthim Shoulder Pauldron (Re-Stitched)',
    category: 'Frankenstein Bio-Graft',
    priceGp: 310,
    originalGp: 480,
    rating: '4.6 ★',
    reviews: 319,
    primeDelivery: 'SAME-CYCLE AETHER DRONE DROP',
    gemSprite: '/assets/konran/stones/fronts/krayvuk.png',
    tagline: 'Harvested from genuine crystal-beetle shock troopers and wired with galvanic copper!',
    dnd55eEffect: '+1 bonus to AC while wearing light or medium armor; Advantage on saves against being shoved or knocked prone.',
    sideEffectWarning: 'Clicks rhythmically when near unharvested Gelfling or Fated souls.',
    inStock: 4,
  },
  {
    id: 'oh-hummingbird-deliverer',
    name: 'Clockwork Hummingbird Potion Deliverer (Pryme)',
    category: 'Prime Relic',
    priceGp: 125,
    originalGp: 500,
    rating: '5.0 ★',
    reviews: 1840,
    primeDelivery: 'BLACKHEART SPIRE DRONE DISPATCH',
    gemSprite: '/assets/konran/stones/fronts/vyvain.png',
    tagline: 'Official ObsydianHeart Order Form bestseller! Avoids combat and administers potions at 300 ft range!',
    dnd55eEffect: 'Bonus Action command: Clockwork Hummingbird flies up to 300 ft (provoking no Opportunity Attacks) and administers a loaded potion to an ally.',
    sideEffectWarning: 'Pryme Member price 125 GP (Public retail 500 GP). Hums Dusty RuneShine jingles while idle.',
    inStock: 9,
  },
  {
    id: 'oh-jellyfish-stunner',
    name: 'DepthSpire Jellyfish Finger Stunner (Pryme)',
    category: 'Frankenstein Bio-Graft',
    priceGp: 75,
    originalGp: 300,
    primeDelivery: 'DEPTHSPIRE BIO-LAB EXPRESS',
    rating: '4.8 ★',
    reviews: 930,
    gemSprite: '/assets/konran/stones/fronts/ousava.png',
    tagline: 'Cultivated in the Underwater Sanctum beneath BlackHeart Spire! Zap foes prone from 50 feet!',
    dnd55eEffect: 'Range 50 ft bio-shock: Target makes a DC 17 Dexterity save or is Stunned and knocked Prone for 1d4 rounds.',
    sideEffectWarning: 'Keep away from open goblets of water during polite dinner conversation.',
    inStock: 6,
  },
  {
    id: 'oh-spyder-launcher',
    name: 'Slavynian Spyder-Silk Wrist Launcher',
    category: 'Prime Relic',
    priceGp: 750,
    originalGp: 3000,
    primeDelivery: 'SAME-CYCLE AETHER DRONE DROP',
    rating: '4.9 ★',
    reviews: 774,
    gemSprite: '/assets/konran/stones/fronts/slavyna.png',
    tagline: 'Deploys a 500-foot strand of high-tensile web capable of hauling 350 lbs! Cord refills 55 GP.',
    dnd55eEffect: 'Action or Reaction: Fire a 500 ft web line (holds 350 lbs) to grapple, traverse chasms, or pull allies.',
    sideEffectWarning: 'Pryme Member price 750 GP (Public retail 3,000 GP).',
    inStock: 3,
  },
  {
    id: 'oh-charity-weapon',
    name: 'The "Charity" Chair-Blade Transformer (Pryme)',
    category: 'Goa\'uld Control Crystal',
    priceGp: 550,
    originalGp: 2000,
    primeDelivery: 'STARGATE RING TRANSPORTER READY',
    rating: '4.9 ★',
    reviews: 615,
    gemSprite: '/assets/konran/stones/fronts/kayzoku.png',
    tagline: 'Two command words: turns your lethal weapon into a harmless 5ft chair—and back into your hands while sitting!',
    dnd55eEffect: 'Command Word 1 transforms weapon into an unassuming chair; Command Word 2 transforms it back into your hands immediately (Advantage on surprise initiative).',
    sideEffectWarning: 'Do not speak the second command word while an inquisitor is sitting on your sword.',
    inStock: 4,
  },
];

const POPUP_ADS = [
  {
    id: 'ad-1',
    header: '⚡ LIGHTNING DEAL // GOA\'ULD SARCOPHAGUS CLEARANCE!',
    title: 'TIRED OF DYING IN DUNGEONS? LEASE A GOLDEN SARCOPHAGUS TODAY!',
    body: 'ObsydianHeart Bio-Graft Division guarantees 99.4% soul retention! First 50 Declared Operatives get a FREE Frankenstein Neck-Bolt Charger!',
    cta: 'CLAIM 40% OFF COUPON',
    discountGp: 25,
  },
  {
    id: 'ad-2',
    header: '💎 DARK CRYSTAL FLASH SALE // SKEKSIS SURPLUS!',
    title: 'UNLIMITED MANA CAPACITORS — STRAIGHT FROM THE GREAT CONJUNCTION!',
    body: 'Why wait for a Long Rest when you can slot an unstable Violet Control Crystal directly into your spinal gauntlet? Approved by 4 out of 5 unlicensed stitch-chirurgeons!',
    cta: 'INJECT SAVINGS NOW',
    discountGp: 30,
  },
  {
    id: 'ad-3',
    header: '🛸 STARGATE RING-DROP PRIME MEMBERSHIP!',
    title: 'UPGRADE TO OBSYDIAN-PRIME FOR 0 GP TODAY!',
    body: 'Includes instant orbital ring-transport delivery, priority Resurrection Queue, and fewer eldritch ad-screams during stealth checks!',
    cta: 'ACTIVATE TRIAL REBATE',
    discountGp: 20,
  },
];

const COMMODITIES = [
  { name: 'Kraykatyzate Control Crystal (100g)', ticker: 'KRAY', price: '450 GP', delta: '+12.4%', up: true },
  { name: 'Distilled Skeksis Essence (1 Vial)', ticker: 'SKEK', price: '185 GP', delta: '+19.8%', up: true },
  { name: 'Galvanic Frankenstein Bio-Coils', ticker: 'VOLT', price: '290 GP', delta: '+6.2%', up: true },
  { name: 'Goa\'uld Naquadah Ring-Capacitor', ticker: 'NAQD', price: '620 GP', delta: '-1.8%', up: false },
];

export const ObsydianExchangeView: React.FC = () => {
  const { activeCharacter, updateCharacter } = useCharacter();
  const [fallbackBalance, setFallbackBalance] = useState(2450);
  const [activePopupIndex, setActivePopupIndex] = useState<number | null>(0);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(842);

  const goldBalance = activeCharacter?.stats?.goldGp ?? fallbackBalance;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleBuyItem = (item: CrystalCatalogItem) => {
    playDivineReveal();
    if (activeCharacter) {
      const currentStats = activeCharacter.stats || {
        str: 10,
        dex: 14,
        con: 14,
        int: 16,
        wis: 12,
        cha: 13,
        hpCurrent: 38,
        hpMax: 38,
        tempHp: 0,
        ac: 15,
        speed: 30,
        proficiencyBonus: 3,
        initiativeBonus: 2,
        goldGp: 450,
        hitDice: '5d8',
      };
      const nextGold = Math.max(0, (currentStats.goldGp ?? 450) - item.priceGp);
      const nextInventory = [
        ...(activeCharacter.inventory || []),
        {
          id: `inv_${Date.now()}`,
          name: item.name,
          category: 'Magitech' as const,
          quantity: 1,
          valueGp: item.priceGp,
          attuned: true,
          description: `${item.dnd55eEffect} [OH-OS Warning: ${item.sideEffectWarning}]`,
        },
      ];
      updateCharacter(activeCharacter.id, {
        stats: { ...currentStats, goldGp: nextGold },
        inventory: nextInventory,
      });
      setCartNotice(
        `STARGATE RING-TRANSPORT COMPLETE! "${item.name}" beamed directly into ${activeCharacter.name}'s Inventory Vault (-${item.priceGp} GP).`
      );
    } else {
      setFallbackBalance((prev) => Math.max(0, prev - item.priceGp));
      setCartNotice(`ONE-CLICK RING-DROP COMPLETE! "${item.name}" dispatched via Aether Drone!`);
    }
    setTimeout(() => setCartNotice(null), 5000);
  };

  const handleClaimAdRebate = (ad: (typeof POPUP_ADS)[0]) => {
    playOptionSelect();
    if (activeCharacter) {
      const currentStats = activeCharacter.stats || {
        str: 10,
        dex: 14,
        con: 14,
        int: 16,
        wis: 12,
        cha: 13,
        hpCurrent: 38,
        hpMax: 38,
        tempHp: 0,
        ac: 15,
        speed: 30,
        proficiencyBonus: 3,
        initiativeBonus: 2,
        goldGp: 450,
        hitDice: '5d8',
      };
      updateCharacter(activeCharacter.id, {
        stats: {
          ...currentStats,
          goldGp: (currentStats.goldGp ?? 450) + ad.discountGp,
        },
      });
    } else {
      setFallbackBalance((prev) => prev + ad.discountGp);
    }
    setCartNotice(
      `OH-OS PROMO REBATE CREDITED! +${ad.discountGp} GP added to your wallet for accepting ObsydianHeart targeted crystal telemetry!`
    );
    setActivePopupIndex(null);
    setTimeout(() => setCartNotice(null), 4500);
  };

  const handleTriggerNextAd = () => {
    playKeyClick();
    setActivePopupIndex((prev) => (prev === null ? 0 : (prev + 1) % POPUP_ADS.length));
  };

  return (
    <div className="w-full h-full ohos-crystal-hull p-3 sm:p-5 overflow-y-auto space-y-4 font-mono text-xs select-text text-white relative">
      {/* Top Scrolling Commercial Marquee / Alien Telemetry Ticker */}
      <div className="bg-gradient-to-r from-[#3b0764] via-[#7c2d12] to-[#3b0764] border border-amber-400/60 px-3 py-1.5 rounded flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(217,70,239,0.4)]">
        <div className="flex items-center gap-2 truncate">
          <Zap className="w-4 h-4 text-amber-300 shrink-0 animate-bounce" />
          <span className="text-[11px] font-bold tracking-wider text-amber-200 truncate">
            [OH-OS v4.2 MEGACORP FEED] ⚡ FLASH CONJUNCTION SALE ENDS IN {formatCountdown(countdown)}! • FREE STARGATE RING-DROP ON ORDERS OVER 200 GP! • NEW FRANKEN-GRAFTS IN STOCK!
          </span>
        </div>
        <button
          onClick={handleTriggerNextAd}
          className="px-2 py-0.5 bg-amber-400 text-black font-bold text-[10px] rounded-xs uppercase shrink-0 cursor-pointer hover:bg-amber-300"
        >
          Spawn Deal Popup
        </button>
      </div>

      {/* Goa'uld / CrystalPunk Header Console */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-black/75 border-2 border-amber-500/50 rounded-lg shadow-[inset_0_0_25px_rgba(217,70,239,0.2)] relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <img
              src="/assets/konran/stones/fronts/lens_1_1.png"
              alt="Control Crystal"
              className="w-11 h-11 object-contain animate-crystal-shard"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wider uppercase">
                ObsydianHeart // CrystalPunk Prime Emporium
              </h2>
              <span className="px-1.5 py-0.5 text-[9px] bg-fuchsia-600/30 border border-fuchsia-400 text-fuchsia-200 rounded uppercase font-bold">
                OH-OS v4.2
              </span>
            </div>
            <p className="text-[10px] text-fuchsia-200/80">
              Goa'uld Control Crystals • Dark Crystal Essences • Dr. Frankenstein Bio-Grafts • 1-Click Ring-Drop Delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded bg-amber-500/15 border border-amber-400/60 text-amber-300 text-xs">
            TREASURY: <strong className="text-white text-sm">{goldBalance.toLocaleString()} GP</strong>
          </div>
        </div>
      </div>

      {/* Purchase / Rebate Notification Toast */}
      {cartNotice && (
        <div className="p-3 bg-emerald-950/90 border-2 border-[#39ff14] rounded-md text-[#39ff14] flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(57,255,20,0.4)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold text-xs">{cartNotice}</span>
          </div>
          <button onClick={() => setCartNotice(null)} className="text-white/70 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INTRUSIVE IN-WORLD CRYSTAL-PUNK / AMAZON / DARK CRYSTAL POPUP AD */}
      {activePopupIndex !== null && POPUP_ADS[activePopupIndex] && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-[#2e0538] via-[#12091c] to-[#3b1506] border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.45)] relative overflow-hidden animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <img
                src="/assets/konran/stones/fronts/sphere_1.png"
                alt="Ad Crystal"
                className="w-12 h-12 object-contain shrink-0 animate-crystal-shard hidden sm:block"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-400 text-black font-bold text-[10px] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>{POPUP_ADS[activePopupIndex].header}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {POPUP_ADS[activePopupIndex].title}
                </h3>
                <p className="text-xs text-fuchsia-100/90 font-sans">
                  {POPUP_ADS[activePopupIndex].body}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleClaimAdRebate(POPUP_ADS[activePopupIndex])}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-fuchsia-500 hover:from-amber-300 hover:to-fuchsia-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer ohos-cartouche-btn shadow-md"
                  >
                    {POPUP_ADS[activePopupIndex].cta} (+{POPUP_ADS[activePopupIndex].discountGp} GP)
                  </button>
                  <button
                    onClick={() => setActivePopupIndex(null)}
                    className="px-2.5 py-1 text-[10px] text-white/60 hover:text-white underline cursor-pointer"
                  >
                    [Dismiss Hologram Ad — I Prefer Mortal Fragility]
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActivePopupIndex(null)}
              className="p-1 bg-black/50 border border-amber-400/50 text-amber-300 hover:text-white rounded cursor-pointer"
              title="Close Sponsored Crystal Transmission"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1-CLICK CRYSTAL-PRIME STOREFRONT GRID */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-xs">
            <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
            <span>Obsydian-Prime Lightning Deals (Direct-to-Inventory Vault)</span>
          </div>
          <span className="text-[10px] text-fuchsia-300">
            SPONSORED BY OBSYDIANHEART R&amp;D
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CRYSTAL_CATALOG.map((item) => {
            const canAfford = goldBalance >= item.priceGp;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-black/75 border border-amber-500/40 hover:border-fuchsia-400 transition-all flex flex-col justify-between gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-200 rounded-xs">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold">
                      {item.rating} ({item.reviews} verified souls)
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-fuchsia-950/60 to-black border border-amber-500/40 p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={item.gemSprite}
                        alt={item.name}
                        className="w-full h-full object-contain animate-crystal-shard"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-amber-200/80 italic font-sans mt-0.5">
                        "{item.tagline}"
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-fuchsia-950/30 border-l-2 border-fuchsia-400 text-[11px] text-fuchsia-100">
                    <strong className="text-amber-300 uppercase">5.5e Relic Effect:</strong> {item.dnd55eEffect}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-red-300/90 bg-red-950/30 px-2 py-1 rounded border border-red-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong>Bio-Graft Disclaimer:</strong> {item.sideEffectWarning}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-amber-300">{item.priceGp} GP</span>
                      <span className="text-[10px] text-white/40 line-through">{item.originalGp} GP</span>
                    </div>
                    <div className="text-[9px] text-[#39ff14] font-bold">
                      ✓ {item.primeDelivery} (Only {item.inStock} left!)
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={!canAfford}
                    className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ohos-cartouche-btn transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-fuchsia-500 text-black hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '⚡ 1-Click Ring-Drop' : 'Insufficient GP'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Inter-Providence Commodities Board */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-[11px] text-amber-300 uppercase tracking-wider border-b border-amber-500/30 pb-1">
          <span>Goa'uld Pel'tak &amp; Inter-Providence Crystal Futures</span>
          <span className="text-[10px] text-fuchsia-300">LIVE TICKER</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {COMMODITIES.map((item) => (
            <div
              key={item.ticker}
              className="p-2.5 bg-black/70 border border-amber-500/30 rounded flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white text-[11px]">{item.name}</div>
                <div className="text-[9px] text-fuchsia-400 font-mono">{item.ticker} // SPOT</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-amber-300 font-mono">{item.price}</div>
                <div
                  className={`text-[10px] flex items-center justify-end gap-0.5 ${
                    item.up ? 'text-[#39ff14]' : 'text-red-400'
                  }`}
                >
                  {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{item.delta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
