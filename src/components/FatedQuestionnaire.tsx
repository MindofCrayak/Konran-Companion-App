import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Skull,
  Heart,
  User,
  Star,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { NyneDeityId, FatedLifepathData } from '../types';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';

export interface DeityLifepathConfig {
  id: NyneDeityId;
  displayName: string;
  title: string;
  desc: string;
  aspects: Array<{ name: string; mods: string }>;
  sects: Array<{ name: string; desc: string }>;
  enemy: { deity: string; fame: number };
}

export const LIFEPATH_DEITIES: Record<string, DeityLifepathConfig> = {
  Ousava: {
    id: 'Ousava',
    displayName: 'Ousava',
    title: 'The Mother',
    desc: 'Goddess of life and the elements. A Cecaelia - Gentle and kind.',
    aspects: [
      { name: 'The Maiden', mods: '+1 Athletics, Insight, Perception' },
      { name: 'The Mother', mods: '+1 Insight, Religion, Performance' },
      { name: 'The Crone', mods: '+1 Animal Handling, Arcana, Religion' },
    ],
    sects: [
      { name: 'Kabal of Life', desc: 'Mysterious branch focused on shaping life and elemental focus.' },
      { name: 'Servants of the Seas', desc: 'Cecaelia power structure cultivating sacred kelp for the Golden Scroll.' },
      { name: 'Elders of the Earth', desc: 'Ancients fused with elements as immortal loremasters.' },
      { name: 'Acolytes of the Ayr', desc: 'Internal order of justice and transparency between elements.' },
      { name: 'Fyends of the Fyre', desc: 'Phoenix/Salamander hybrid builders and architects.' },
    ],
    enemy: { deity: 'Krayvuk', fame: 10 },
  },
  Oray: {
    id: 'Oray',
    displayName: 'Oray',
    title: 'The Magician',
    desc: 'God of Magic. A dragon waiting to take what he sees fit.',
    aspects: [
      { name: 'Wielder of Might', mods: '+1 Intimidate, Insight, Arcana' },
      { name: 'Wielder of Wisdom', mods: '+1 History, Arcana, Religion' },
      { name: 'Wielder of Deception', mods: '+1 Sleight of Hand, Deception, Intimidation' },
    ],
    sects: [
      { name: 'Tower of the Scholar', desc: 'Practitioners pushing boundaries and creating new spells.' },
      { name: 'Tower of Superstition', desc: 'Traditionalists who use magic sparingly and through routine.' },
      { name: 'Tower of the Dragon', desc: 'Respecters of the noble order of dragons guarding watchtowers.' },
      { name: 'Tower of Substantyaliti', desc: 'Masters of transfiguration, builders, and bards.' },
      { name: 'Tower of Causalyti', desc: 'Dreamers who allow wild magic to follow imagination.' },
    ],
    enemy: { deity: 'Ayan/Ai', fame: 10 },
  },
  Lyricia: {
    id: 'Lyricia',
    displayName: 'Lyricia',
    title: 'The Wysets',
    desc: 'Goddess of knowledge and ingenuity. Victorian Elf with Skryllion otters.',
    aspects: [
      { name: 'The Archivist', mods: '+1 Arcana, History, Medicine, Religion' },
      { name: 'The Tinkerer', mods: '+1 Investigation, Perform, Persuasion' },
      { name: 'The Oologist', mods: '+1 Animal Handling, Nature, Survival' },
    ],
    sects: [
      { name: 'School of the Scholar', desc: 'Dedicated to basic knowledge and the written word.' },
      { name: 'Order of the Overseer', desc: 'Priestesshood specializing in divination and prophecies.' },
      { name: 'Oryginator Academy', desc: 'Scientists and smiths in subterranean forges.' },
      { name: 'Tresurer Marketplace', desc: 'Focus on currency and fundamentals of commerce.' },
      { name: 'Palace of the Partycioner', desc: 'Monks skilled in healing and medicine.' },
    ],
    enemy: { deity: 'Psyon', fame: 5 },
  },
  Krayvuk: {
    id: 'Krayvuk',
    displayName: 'Krayvuk',
    title: 'The Malevolent',
    desc: 'God of time and space. Part biological, part machine.',
    aspects: [
      { name: 'Lord of Tyme', mods: '+1 History, Perception, Investigation' },
      { name: 'Master of Space', mods: '+1 Nature, Religion, Stealth' },
      { name: 'Skree Father', mods: '+1 Deception, Insight, Medicine' },
    ],
    sects: [
      { name: 'Waves of Necros', desc: 'Followers unbothered by death, brokering souls.' },
      { name: 'Collective of the Cyrcut', desc: 'Shadowy figures designing war machines.' },
      { name: 'Fleet of the Expanz', desc: 'Students of the stars and the void between planes.' },
      { name: 'Vergence Horizon', desc: 'Marshalls of time with lifelines at their fingertips.' },
      { name: 'Apogee Initiative', desc: 'Militant Skree hivemind constantly evolving.' },
    ],
    enemy: { deity: 'Ousava', fame: 10 },
  },
  Slavyna: {
    id: 'Slavyna',
    displayName: 'Slavyna',
    title: 'The Mistress',
    desc: 'Goddess of vengeance and desire. Succubus queen.',
    aspects: [
      { name: 'The Mystress', mods: '+1 Performance, Perception, Sleight of Hand' },
      { name: 'Mother of Demons', mods: '+1 Arcana, Religion, Nature' },
      { name: 'Mother', mods: '+1 Deception, Intimidation, Stealth' },
    ],
    sects: [
      { name: 'Family of Blood', desc: 'Focus on purification and blood manipulation.' },
      { name: 'Sect of Shadows', desc: 'Fearful tools of the church, spies in every corner.' },
      { name: 'Depths of Darkness', desc: 'The militant Dark Legion with teeth in the dark.' },
      { name: 'Spyder Systerhood', desc: 'Shadow Elf matriarchy focusing on patience and feminine energy.' },
      { name: 'The Lust Lyne', desc: 'Certified establishments overseen by the Lust Wraiths.' },
    ],
    enemy: { deity: 'Vyvain', fame: 20 },
  },
  Psyon: {
    id: 'Psyon',
    displayName: 'Psyon',
    title: 'The Mad',
    desc: 'Mindflayer who gave the worlds the curse of madness.',
    aspects: [
      { name: 'Haunter of Dreams', mods: '+1 Perception, Deception, Stealth' },
      { name: 'Master of Fears', mods: '+1 Insight, Intimidation, History' },
      { name: 'Lord of Illusions', mods: '+1 Persuasion, Sleight of Hand, Deception' },
    ],
    sects: [
      { name: 'Lunaci', desc: 'Masters of unhinging the mind with paradox and fear.' },
      { name: 'Dementya', desc: 'Memory stealers who bargain and sell feelings.' },
      { name: 'Manya', desc: 'Maniaiasts whose moods cause anarchy and blood baths.' },
      { name: 'Delusyona', desc: 'Fiends of illusion turning fiction into reality.' },
      { name: 'Histerya', desc: 'Lords of chaos inspiring anarchy and forbidden acts.' },
    ],
    enemy: { deity: 'Lyricia', fame: 5 },
  },
  'Ayan/Ai': {
    id: 'Ay',
    displayName: 'Ayan/Ai (Ay)',
    title: 'The Other',
    desc: 'Genderfluid God/dess of Fate, Chance, and the Lottery.',
    aspects: [
      { name: 'The Weaver', mods: '+1 Deception, Persuasion, Stealth' },
      { name: 'The Watcher', mods: '+1 History, Perception, Investigation' },
      { name: 'The Wild Card', mods: '+1 Insight, Sleight of Hand, Perform' },
    ],
    sects: [
      { name: 'Foreman of Fate', desc: 'Selectors of the Lottery measuring balance.' },
      { name: 'Agents of the Arrow', desc: 'Reclusive executioners of fate and keepers of Abbadon.' },
      { name: 'Dreamers of Destiny', desc: 'Well-connected go-getters drawn from raw creativity.' },
      { name: 'Curators of Cause', desc: 'Order-followers who push people in specific directions.' },
      { name: 'Exhibitors of Effect', desc: 'Watchers ensuring plans are followed with documentation.' },
    ],
    enemy: { deity: 'Oray', fame: 10 },
  },
  Vyvain: {
    id: 'Celeste',
    displayName: 'Vyvain (Celeste)',
    title: 'The Merry',
    desc: 'Goddess of competition, war, and the arts. Ever-changing beauty.',
    aspects: [
      { name: 'The Builder', mods: '+1 Nature, History, Perception' },
      { name: 'The Debutant', mods: '+1 Deception, Performance, Intimidation' },
      { name: 'The Gladiator', mods: '+1 Athletics, Survival, Acrobatics' },
    ],
    sects: [
      { name: 'School of Hearth', desc: 'Mastery of home, cooking, and hosting.' },
      { name: 'Athletic Academy', desc: 'Unity of body, mind, and spirit through physical mastery.' },
      { name: 'Tower of Warfare', desc: 'The Stone Enclave, the armed forces of Vyvain.' },
      { name: 'Theyogin Collective', desc: 'Thinkers, plotters, and hidden intelligence.' },
      { name: 'University of Expression', desc: 'Performers seeking immortality as Legends.' },
    ],
    enemy: { deity: 'Slavyna', fame: 20 },
  },
  Kayizoku: {
    id: 'Kayzoku',
    displayName: 'Kayizoku (Kayzoku)',
    title: 'The Trickster',
    desc: 'Kitsune master of treasures, traps, and unpredictability.',
    aspects: [
      { name: 'The Plotter', mods: '+1 Deception, Sleight of Hand, Stealth' },
      { name: 'The Sayer', mods: '+1 Intimidation, Performance, Persuasion' },
      { name: 'The Doer', mods: '+1 Acrobatics, Athletics, Survival' },
    ],
    sects: [
      { name: 'Link of Trickery', desc: 'Confidence men and swashbucklers. To trick is to live.' },
      { name: 'Link of Balance', desc: 'Adapters who float rather than fall.' },
      { name: 'Link of Enlightenment', desc: "Existing in the 'now', knowing outcomes before they happen." },
      { name: 'Link of Deception', desc: 'Knowers of lies and the truth that everyone else lies.' },
      { name: 'Link of Order', desc: 'Strong leaders following a strict, personal golden rule.' },
    ],
    enemy: { deity: 'Ayan/Ai', fame: 8 },
  },
};

function mapNyneIdToKey(id?: NyneDeityId): string | null {
  if (!id) return null;
  if (id === 'Ay') return 'Ayan/Ai';
  if (id === 'Celeste') return 'Vyvain';
  if (id === 'Kayzoku') return 'Kayizoku';
  return id;
}

interface QuestionnaireState {
  characterName: string;
  primaryDeity: string | null;
  aspect: { name: string; mods: string } | null;
  sect: { name: string; desc: string } | null;
  secondaryDeity: string | null;
  thirdDeity: string | null;
  enemy: { deity: string; fame: number } | null;
  specialAbility: string;
  interests: string;
  sectStanding: string | null;
  fatedView: string | null;
  accomplishment: string | null;
  haunt: string;
  familyDesc: string | null;
  perfectDeath: string;
  scores: {
    fate: number;
    fame: number;
    favor: number;
  };
}

const INITIAL_STATE: QuestionnaireState = {
  characterName: '',
  primaryDeity: null,
  aspect: null,
  sect: null,
  secondaryDeity: null,
  thirdDeity: null,
  enemy: null,
  specialAbility: '',
  interests: '',
  sectStanding: null,
  fatedView: null,
  accomplishment: null,
  haunt: '',
  familyDesc: null,
  perfectDeath: '',
  scores: {
    fate: 0,
    fame: 0,
    favor: 0,
  },
};

interface FatedQuestionnaireProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const FatedQuestionnaire: React.FC<FatedQuestionnaireProps> = ({
  onClose,
  isEmbedded = false,
}) => {
  const { activeCharacter, updateCharacter, joinFaction } = useCharacter();
  const [step, setStep] = useState<number>(0);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [data, setData] = useState<QuestionnaireState>(() => ({
    ...INITIAL_STATE,
    characterName: activeCharacter?.name || '',
    primaryDeity: mapNyneIdToKey(activeCharacter?.declaredDeity),
  }));

  useEffect(() => {
    if (activeCharacter && step === 0 && !data.characterName) {
      setData((prev) => ({
        ...prev,
        characterName: activeCharacter.name,
        primaryDeity: prev.primaryDeity || mapNyneIdToKey(activeCharacter.declaredDeity),
      }));
    }
  }, [activeCharacter, step, data.characterName]);

  const handleDeitySelect = (deityKey: string) => {
    playOptionSelect();
    setData((prev) => ({
      ...prev,
      primaryDeity: deityKey,
      aspect: null,
      sect: null,
      scores: { ...prev.scores, favor: prev.scores.favor + 1 },
    }));
    setStep((prev) => prev + 1);
  };

  const handleOptionSelect = (
    key: keyof QuestionnaireState,
    value: any,
    scoreUpdates: Array<{ key: 'fate' | 'fame' | 'favor'; val: number }> = []
  ) => {
    playOptionSelect();
    setData((prev) => {
      const nextScores = { ...prev.scores };
      scoreUpdates.forEach((update) => {
        nextScores[update.key] += update.val;
      });
      return {
        ...prev,
        [key]: value,
        scores: nextScores,
      };
    });
    setStep((prev) => prev + 1);
  };

  const handleBindLifepathToCharacter = () => {
    if (!activeCharacter || !data.primaryDeity) return;
    playDivineReveal();

    const deityConfig = LIFEPATH_DEITIES[data.primaryDeity];
    const lifepathPayload: FatedLifepathData = {
      primaryDeity: data.primaryDeity,
      aspect: data.aspect?.name || 'Unchosen Aspect',
      aspectMods: data.aspect?.mods || '',
      sect: data.sect?.name || 'Unchosen Sect',
      sectDesc: data.sect?.desc || '',
      secondDeity: data.secondaryDeity || 'None',
      thirdDeity: data.thirdDeity || 'None',
      divineEnemy: data.enemy?.deity || deityConfig?.enemy.deity || 'Unknown',
      specialAbilities: data.specialAbility,
      interests: data.interests,
      sectStanding: data.sectStanding || 'Secure',
      fateView: data.fatedView || 'Welcomed',
      greatDeed: data.accomplishment || 'Good',
      previousLife: data.haunt,
      familyTies: data.familyDesc || 'Favorably',
      perfectDeath: data.perfectDeath,
      fateScore: data.scores.fate,
      fameScore: data.scores.fame,
      favorScore: data.scores.favor,
      completedAt: new Date().toISOString(),
    };

    updateCharacter(activeCharacter.id, {
      name: data.characterName.trim() || activeCharacter.name,
      declaredDeity: activeCharacter.declaredDeity || deityConfig?.id,
      deityDevotionTier: Math.max(activeCharacter.deityDevotionTier || 1, 2),
      hasCompletedLifepath: true,
      lifepath: lifepathPayload,
      deityBoon: data.aspect
        ? {
            id: `boon_aspect_${data.aspect.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: `${data.primaryDeity}: ${data.aspect.name} (${data.sect?.name || 'Sect'})`,
            sourceType: 'deity_patron',
            sourceName: `${data.primaryDeity} (${deityConfig?.title || ''})`,
            description: data.sect?.desc || deityConfig?.desc || '',
            dndMechanic: `${data.aspect.mods} | Fate (d4): ${data.scores.fate >= 0 ? '+' : ''}${data.scores.fate}, Fame (d6): ${data.scores.fame >= 0 ? '+' : ''}${data.scores.fame}, Favor (d12): ${data.scores.favor >= 0 ? '+' : ''}${data.scores.favor}`,
            actionType: 'passive',
            recharge: 'at_will',
          }
        : activeCharacter.deityBoon,
    });

    if (data.sect && deityConfig) {
      joinFaction(activeCharacter.id, {
        factionId: data.sect.name.toLowerCase().replace(/\s+/g, '_'),
        factionName: data.sect.name,
        deitySponsor: deityConfig.id,
        rankTier: data.sectStanding === 'Secure' ? 2 : 1,
        rankTitle: `${data.aspect?.name || 'Initiate'} of ${data.sect.name}`,
        reputationScore: 100 + data.scores.favor * 10,
        clearanceLevel: 'restricted',
        unlockedBoons: [],
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    // Attempt backend sync if Express server is active
    fetch(`/api/characters/${activeCharacter.id}/lifepath`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lifepathPayload),
    }).catch(() => {
      // Offline / local mode fallback
    });

    setSavedNotice(
      `COVENANT SECT & LIFEPATH SEALED TO ${activeCharacter.name.toUpperCase()} // ${data.sect?.name.toUpperCase() || ''}`
    );
  };

  const progress = step === 100 ? 100 : Math.min(100, (step / 14) * 100);
  const currentDeity = data.primaryDeity ? LIFEPATH_DEITIES[data.primaryDeity] : null;

  return (
    <div
      className={`w-full ${
        isEmbedded ? 'h-full overflow-y-auto' : 'max-w-4xl mx-auto my-6'
      } bg-[#030508]/95 border-2 border-[#d4af37] rounded-sm shadow-[0_0_45px_rgba(212,175,55,0.28)] text-[#e2e8f0] font-sans flex flex-col`}
    >
      {/* Header / Stats Bar */}
      <div className="bg-gradient-to-r from-black via-[#0a140f] to-black p-4 sm:p-6 border-b border-[#d4af37]/50 shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-totally-gothic text-[#ffcc00] tracking-wider flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#39ff14]" />
              <span>Questionnaire of the Fated</span>
            </h1>
            <p className="text-[#ded7f0]/70 text-xs font-mono uppercase tracking-widest mt-0.5">
              Declared Sect, Aspect &amp; Soul Lottery Lifepath // System of Konran
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ScoreCard
              label="Fate (d4)"
              value={data.scores.fate}
              color="text-purple-400"
              icon={<Sparkles size={15} />}
            />
            <ScoreCard
              label="Fame (d6)"
              value={data.scores.fame}
              color="text-amber-400"
              icon={<Star size={15} />}
            />
            <ScoreCard
              label="Favor (d12)"
              value={data.scores.favor}
              color="text-[#39ff14]"
              icon={<Heart size={15} />}
            />
            {onClose && !isEmbedded && (
              <button
                onClick={onClose}
                className="p-2 rounded border border-[#d4af37]/40 bg-black/70 text-[#d4af37] hover:text-white hover:border-[#d4af37] cursor-pointer"
                title="Close Questionnaire"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 h-1.5 bg-black/80 border border-[#d4af37]/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] to-[#39ff14] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-8 flex-1 overflow-y-auto">
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-totally-gothic text-[#ffcc00]">
                Welcome, Reborn Hero of the Soul Lottery.
              </h2>
              <p className="text-sm sm:text-base text-[#ded7f0]/90 leading-relaxed">
                Once you changed worlds. You died a hero&apos;s death and were entered into the{' '}
                <span className="text-[#ffcc00] font-bold">Soul Lottery</span>. Your number was called.
              </p>
              <p className="text-sm sm:text-base text-[#ded7f0]/80 leading-relaxed">
                You are reborn on <span className="italic text-[#39ff14]">Konran</span>. These 14 steps define which{' '}
                <strong className="text-white">Divine Aspect</strong> and{' '}
                <strong className="text-white">Religious Sect</strong> of your Declared Deity you follow, along with the{' '}
                <span className="text-purple-300 font-mono">Fate (d4)</span>,{' '}
                <span className="text-amber-300 font-mono">Fame (d6)</span>, and{' '}
                <span className="text-[#39ff14] font-mono">Favor (d12)</span> buffs bound to your soul.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#ffcc00]/80">
                What is your Character Name (or name in your previous life)?
              </label>
              <input
                type="text"
                className="w-full bg-black/80 border border-[#d4af37]/50 rounded p-3 text-lg text-white font-mono outline-none focus:border-[#39ff14] transition-all"
                placeholder="Enter Character Name..."
                value={data.characterName}
                onChange={(e) => setData({ ...data, characterName: e.target.value })}
              />

              <button
                disabled={!data.characterName.trim()}
                onClick={() => {
                  playKeyClick();
                  setStep(1);
                }}
                className="w-full bg-[#d4af37]/20 hover:bg-[#d4af37]/30 disabled:opacity-40 border-2 border-[#d4af37] text-[#ffcc00] hover:text-white font-mono uppercase tracking-widest font-bold py-3.5 rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Begin Sect &amp; Lifepath Declaration</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">
                Step 1: Who is your Declared Primary Deity?
              </h2>
              {activeCharacter?.declaredDeity && (
                <p className="text-xs font-mono text-[#39ff14] mt-1">
                  Active Character Covenant Detected: {mapNyneIdToKey(activeCharacter.declaredDeity)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {Object.entries(LIFEPATH_DEITIES).map(([key, d]) => {
                const isPrebound = mapNyneIdToKey(activeCharacter?.declaredDeity) === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleDeitySelect(key)}
                    className={`p-4 rounded text-left transition-all cursor-pointer border ${
                      isPrebound
                        ? 'bg-[#39ff14]/15 border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                        : 'bg-black/70 hover:bg-[#d4af37]/15 border-[#d4af37]/40 hover:border-[#ffcc00]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#ffcc00] font-mono text-sm">
                        {d.displayName}
                      </span>
                      {isPrebound && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#39ff14] text-black font-bold rounded">
                          DECLARED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#39ff14] font-mono mt-0.5 mb-1.5">{d.title}</div>
                    <div className="text-xs text-[#ded7f0]/80 leading-relaxed">{d.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && currentDeity && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-totally-gothic text-[#ffcc00] flex items-center gap-2">
                <User className="text-[#39ff14]" />
                <span>Step 2: Choose your Aspect of {currentDeity.displayName}</span>
              </h2>
              <p className="text-[#ded7f0]/70 text-xs font-mono mt-1">
                This defines your primary skill modifiers (+1 Divine Favor added).
              </p>
              <div className="mt-5 grid gap-3.5">
                {currentDeity.aspects.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => handleOptionSelect('aspect', a)}
                    className="p-4 bg-black/75 hover:bg-[#d4af37]/15 rounded border border-[#d4af37]/40 hover:border-[#ffcc00] text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-base text-white font-mono">{a.name}</div>
                    <div className="text-[#39ff14] text-xs font-mono mt-1">{a.mods}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && currentDeity && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-totally-gothic text-[#ffcc00] flex items-center gap-2">
                <Shield className="text-[#39ff14]" />
                <span>Step 3: Which Religious Sect of {currentDeity.displayName} do you follow?</span>
              </h2>
              <div className="mt-5 grid gap-3.5">
                {currentDeity.sects.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleOptionSelect('sect', s)}
                    className="p-4 bg-black/75 hover:bg-[#d4af37]/15 rounded border border-[#d4af37]/40 hover:border-[#ffcc00] text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-base text-[#ffcc00] font-mono">{s.name}</div>
                    <div className="text-[#ded7f0]/80 text-xs leading-relaxed mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">
              Step 4: Polytheistic Invocations (Secondary)
            </h2>
            <p className="text-sm text-[#ded7f0]/80">
              What Deity do you find yourself invoking <span className="text-white font-bold">Secondary</span> after your Declared Deity? (+1 Rank)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(LIFEPATH_DEITIES)
                .filter((k) => k !== data.primaryDeity)
                .map((k) => (
                  <button
                    key={k}
                    onClick={() => handleOptionSelect('secondaryDeity', k)}
                    className="p-3.5 bg-black/75 hover:bg-[#d4af37]/20 rounded text-sm font-mono text-[#ffcc00] border border-[#d4af37]/40 hover:border-[#ffcc00] transition-all cursor-pointer"
                  >
                    {LIFEPATH_DEITIES[k].displayName}
                  </button>
                ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">
              Step 5: Minor Invocations (Third)
            </h2>
            <p className="text-sm text-[#ded7f0]/80">
              What Deity do you find yourself invoking <span className="text-white font-bold">Third</span>? (+1 Rank)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(LIFEPATH_DEITIES)
                .filter((k) => k !== data.primaryDeity && k !== data.secondaryDeity)
                .map((k) => (
                  <button
                    key={k}
                    onClick={() => handleOptionSelect('thirdDeity', k)}
                    className="p-3.5 bg-black/75 hover:bg-[#d4af37]/20 rounded text-sm font-mono text-[#ffcc00] border border-[#d4af37]/40 hover:border-[#ffcc00] transition-all cursor-pointer"
                  >
                    {LIFEPATH_DEITIES[k].displayName}
                  </button>
                ))}
            </div>
          </div>
        )}

        {step === 6 && currentDeity && (
          <div className="space-y-6 text-center py-4">
            <Skull className="w-14 h-14 mx-auto text-red-500" />
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">Step 6: Your Divine Enemy</h2>
            <p className="text-sm text-[#ded7f0]/90 max-w-lg mx-auto">
              Spreading the word of <strong className="text-[#ffcc00]">{currentDeity.displayName}</strong> has sowed seeds of discontent with the opposing faction:{' '}
              <span className="text-red-400 font-bold">{currentDeity.enemy.deity}</span>.
            </p>
            <div className="p-5 bg-red-950/30 border border-red-500/50 rounded max-w-md mx-auto">
              <p className="text-base text-red-200 font-mono">You gain -1 rank with {currentDeity.enemy.deity}.</p>
              <p className="text-[#ffcc00] font-bold font-mono mt-2">+{currentDeity.enemy.fame} Fame (d6)</p>
            </div>
            <button
              onClick={() =>
                handleOptionSelect('enemy', currentDeity.enemy, [
                  { key: 'fame', val: currentDeity.enemy.fame },
                ])
              }
              className="w-full max-w-md mx-auto mt-4 bg-red-950/60 hover:bg-red-900 border border-red-400 text-white font-mono uppercase tracking-wider py-3 rounded transition-all cursor-pointer"
            >
              Accept the Divine Rivalry
            </button>
          </div>
        )}

        {step === 7 && (
          <InputStep
            title="Step 7: Special Abilities"
            desc="Were you born with any special abilities or anomalies? (Gain +10 Fame for being known)"
            value={data.specialAbility}
            onChange={(v) => setData({ ...data, specialAbility: v })}
            onNext={() =>
              handleOptionSelect('specialAbility', data.specialAbility, [{ key: 'fame', val: 10 }])
            }
          />
        )}

        {step === 8 && (
          <InputStep
            title="Step 8: Youthful Interests"
            desc="Growing up, what interested you most? (Gain +2 in one skill & an additional feat)"
            value={data.interests}
            onChange={(v) => setData({ ...data, interests: v })}
            onNext={() => {
              playOptionSelect();
              setStep(step + 1);
            }}
          />
        )}

        {step === 9 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">Step 9: The Sect Bond</h2>
            <p className="text-sm text-[#ded7f0]/80">
              What is your standing with <strong className="text-white">{data.sect?.name || 'your sect'}</strong>? Do you trust them?
            </p>
            <button
              onClick={() =>
                handleOptionSelect('sectStanding', 'Secure', [{ key: 'favor', val: 1 }])
              }
              className="w-full p-4 bg-emerald-950/30 border border-[#39ff14]/60 rounded text-left hover:bg-emerald-900/40 cursor-pointer transition-all"
            >
              <div className="font-bold text-[#39ff14] font-mono">Fully Secure &amp; Devoted</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                Take advantage of any Sect Skill. (+1 Favor)
              </div>
            </button>
            <button
              onClick={() =>
                handleOptionSelect('sectStanding', 'Questioning', [{ key: 'favor', val: -1 }])
              }
              className="w-full p-4 bg-amber-950/30 border border-amber-500/60 rounded text-left hover:bg-amber-900/40 cursor-pointer transition-all"
            >
              <div className="font-bold text-amber-300 font-mono">Shed Light / Questioning</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +2 to a new skill of your choice, but -1 Favor.
              </div>
            </button>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">Step 10: Views on Fate</h2>
            <p className="text-sm text-[#ded7f0]/80">How do you view being &quot;Fated&quot;?</p>
            <button
              onClick={() =>
                handleOptionSelect('fatedView', 'Welcomed', [{ key: 'fate', val: 1 }])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-[#39ff14] rounded text-left hover:bg-[#39ff14]/10 cursor-pointer transition-all"
            >
              <div className="font-bold text-[#39ff14] font-mono">Welcome It</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 with Ayan/Ai, +1 Fate Score (d4).
              </div>
            </button>
            <button
              onClick={() =>
                handleOptionSelect('fatedView', 'Resented', [{ key: 'fate', val: -1 }])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-purple-400 rounded text-left hover:bg-purple-950/30 cursor-pointer transition-all"
            >
              <div className="font-bold text-purple-300 font-mono">Reject It / Resent It</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                -1 with Ayan/Ai, -1 Fate Score (d4).
              </div>
            </button>
          </div>
        )}

        {step === 11 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">Step 11: The Great Deed</h2>
            <p className="text-sm text-[#ded7f0]/80">
              What accomplishment in your previous life granted you entry into Konran? (+15 Divine Favor)
            </p>
            <button
              onClick={() =>
                handleOptionSelect('accomplishment', 'Good', [
                  { key: 'favor', val: 15 },
                  { key: 'fame', val: 15 },
                ])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-cyan-400 rounded text-left hover:bg-cyan-950/30 cursor-pointer transition-all"
            >
              <div className="font-bold text-cyan-300 font-mono">A &quot;Good&quot; Heroic Deed</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 with Ousava, +15 Favor, +15 Fame.
              </div>
            </button>
            <button
              onClick={() =>
                handleOptionSelect('accomplishment', 'Neutral', [
                  { key: 'favor', val: 15 },
                  { key: 'fame', val: 5 },
                ])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-amber-400 rounded text-left hover:bg-amber-950/30 cursor-pointer transition-all"
            >
              <div className="font-bold text-amber-300 font-mono">A &quot;Neutral&quot; Pragmatic Deed</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 with Ayan/Ai, +15 Favor, +5 Fame.
              </div>
            </button>
            <button
              onClick={() =>
                handleOptionSelect('accomplishment', 'Evil', [
                  { key: 'favor', val: 15 },
                  { key: 'fame', val: 10 },
                ])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-purple-400 rounded text-left hover:bg-purple-950/30 cursor-pointer transition-all"
            >
              <div className="font-bold text-purple-300 font-mono">An &quot;Evil&quot; Ruthless Deed</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 with Krayvuk, +15 Favor, +10 Fame.
              </div>
            </button>
          </div>
        )}

        {step === 12 && (
          <InputStep
            title="Step 12: Previous Life Haunt"
            desc="What haunts you most about your previous life? (+1 Psyon)"
            value={data.haunt}
            onChange={(v) => setData({ ...data, haunt: v })}
            onNext={() => {
              playOptionSelect();
              setStep(step + 1);
            }}
          />
        )}

        {step === 13 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">Step 13: Family Ties</h2>
            <p className="text-sm text-[#ded7f0]/80">How would your family describe you?</p>
            <button
              onClick={() =>
                handleOptionSelect('familyDesc', 'Favorably', [{ key: 'fame', val: 10 }])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-[#39ff14] rounded text-left hover:bg-[#39ff14]/10 cursor-pointer transition-all"
            >
              <div className="font-bold text-[#39ff14] font-mono">Favorably</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 Ousava or Slavyna, +10 Fame.
              </div>
            </button>
            <button
              onClick={() =>
                handleOptionSelect('familyDesc', 'Dishonorably', [{ key: 'fame', val: -10 }])
              }
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-red-400 rounded text-left hover:bg-red-950/30 cursor-pointer transition-all"
            >
              <div className="font-bold text-red-400 font-mono">Dishonorably</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 Oray or Krayvuk, -10 Fame.
              </div>
            </button>
            <button
              onClick={() => handleOptionSelect('familyDesc', 'Distanced')}
              className="w-full p-4 bg-black/75 border border-[#d4af37]/40 hover:border-amber-400 rounded text-left hover:bg-amber-950/20 cursor-pointer transition-all"
            >
              <div className="font-bold text-amber-200 font-mono">Distanced but Polite</div>
              <div className="text-xs text-[#ded7f0]/80 mt-1">
                +1 Kayizoku or Ayan/Ai, No Fame change.
              </div>
            </button>
          </div>
        )}

        {step === 14 && (
          <InputStep
            title="Step 14: The End"
            desc="What would be a perfect death for you in this new life?"
            value={data.perfectDeath}
            onChange={(v) => setData({ ...data, perfectDeath: v })}
            onNext={() => {
              playDivineReveal();
              setStep(100);
            }}
          />
        )}

        {step === 100 && currentDeity && (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-10 h-10 mx-auto text-[#ffcc00] mb-2" />
              <h2 className="text-2xl sm:text-3xl font-totally-gothic text-[#ffcc00]">
                Profile of the Fated // Sect &amp; Lifepath Record
              </h2>
              <p className="text-xs font-mono text-[#39ff14] uppercase tracking-widest mt-1">
                Your connection to Konran is complete
              </p>
            </div>

            {savedNotice && (
              <div className="p-3 bg-[#39ff14]/15 border border-[#39ff14] rounded text-center font-mono text-xs text-[#39ff14] font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <Section title="Sacred Identity & Sect">
                  <p className="text-xs font-mono">
                    <span className="text-[#ffcc00] font-bold">Name:</span> {data.characterName}
                  </p>
                  <p className="text-xs font-mono">
                    <span className="text-[#ffcc00] font-bold">Declaration:</span>{' '}
                    {currentDeity.displayName} ({currentDeity.title})
                  </p>
                  <p className="text-xs font-mono">
                    <span className="text-[#ffcc00] font-bold">Divine Aspect:</span>{' '}
                    {data.aspect?.name}
                  </p>
                  <p className="text-xs font-mono">
                    <span className="text-[#ffcc00] font-bold">Religious Sect:</span>{' '}
                    <span className="text-[#39ff14] font-bold">{data.sect?.name}</span>
                  </p>
                  {data.sect?.desc && (
                    <p className="text-[11px] text-[#ded7f0]/80 italic mt-1">{data.sect.desc}</p>
                  )}
                </Section>

                <Section title="Mechanical Buffs & Invocations">
                  <div className="text-[#39ff14] text-xs font-mono font-bold bg-black/60 p-2 rounded border border-[#39ff14]/40">
                    Aspect Modifiers: {data.aspect?.mods}
                  </div>
                  <div className="text-[#ded7f0] text-xs font-mono space-y-1 mt-2">
                    <p>• +1 Rank with Secondary: {data.secondaryDeity}</p>
                    <p>• +1 Rank with Third: {data.thirdDeity}</p>
                    <p className="text-red-400">
                      • -1 Rank with Divine Enemy: {data.enemy?.deity || currentDeity.enemy.deity}
                    </p>
                    <p>
                      • Sect Standing: <strong className="text-white">{data.sectStanding}</strong>
                    </p>
                  </div>
                </Section>
              </div>

              <div className="space-y-4">
                <Section title="Soul Lottery Origins">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#ffcc00]/70 font-mono uppercase">Special Ability:</span>
                      <p className="text-white mt-0.5">{data.specialAbility || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-[#ffcc00]/70 font-mono uppercase">Youthful Interests:</span>
                      <p className="text-white mt-0.5">{data.interests || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-[#ffcc00]/70 font-mono uppercase">Previous Life Haunt:</span>
                      <p className="text-white mt-0.5">{data.haunt || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-[#ffcc00]/70 font-mono uppercase">The Perfect Death:</span>
                      <p className="text-white mt-0.5">{data.perfectDeath || 'None recorded'}</p>
                    </div>
                  </div>
                </Section>

                <div className="grid grid-cols-3 gap-2">
                  <ResultScore label="FATE (d4)" val={data.scores.fate} color="purple" />
                  <ResultScore label="FAME (d6)" val={data.scores.fame} color="amber" />
                  <ResultScore label="FAVOR (d12)" val={data.scores.favor} color="emerald" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {activeCharacter && (
                <button
                  onClick={handleBindLifepathToCharacter}
                  className="flex-1 min-w-[220px] bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border-2 border-[#39ff14] text-[#39ff14] hover:text-white py-3 px-4 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>Bind Sect &amp; Buffs to {activeCharacter.name}</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="px-5 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37] text-[#ffcc00] py-3 rounded font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download size={16} />
                <span>Print Record</span>
              </button>
              <button
                onClick={() => {
                  playKeyClick();
                  setSavedNotice(null);
                  setData({
                    ...INITIAL_STATE,
                    characterName: activeCharacter?.name || '',
                    primaryDeity: mapNyneIdToKey(activeCharacter?.declaredDeity),
                  });
                  setStep(0);
                }}
                className="px-5 bg-black/80 hover:bg-white/10 border border-white/20 text-white/80 py-3 rounded font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCcw size={16} />
                <span>Restart</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      {step > 0 && step < 100 && (
        <div className="p-4 bg-black/90 border-t border-[#d4af37]/30 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              playKeyClick();
              setStep(step - 1);
            }}
            className="flex items-center gap-1 text-[#ffcc00]/80 hover:text-white transition-colors text-xs font-mono uppercase cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Previous Step</span>
          </button>
          <span className="text-xs text-[#39ff14] uppercase tracking-widest font-mono font-bold">
            Step {step} of 14
          </span>
        </div>
      )}
    </div>
  );
};

function ScoreCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="px-3 py-1.5 bg-black/80 border border-[#d4af37]/40 rounded flex items-center gap-2">
      <div className="flex items-center gap-1 text-[11px] font-mono text-[#ded7f0]/80">
        {icon}
        <span>{label}:</span>
      </div>
      <span className={`text-sm font-mono font-bold ${color}`}>
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-black/70 border border-[#d4af37]/40 rounded space-y-2">
      <h3 className="text-xs font-mono uppercase tracking-wider text-[#ffcc00] border-b border-[#d4af37]/30 pb-1.5 font-bold">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ResultScore({
  label,
  val,
  color,
}: {
  label: string;
  val: number;
  color: 'purple' | 'amber' | 'emerald';
}) {
  const colors = {
    purple: 'bg-purple-950/40 border-purple-500/60 text-purple-300',
    amber: 'bg-amber-950/40 border-amber-500/60 text-amber-300',
    emerald: 'bg-emerald-950/40 border-[#39ff14]/60 text-[#39ff14]',
  };
  return (
    <div className={`p-3 border rounded text-center font-mono ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-lg font-bold mt-0.5">{val > 0 ? `+${val}` : val}</div>
    </div>
  );
}

function InputStep({
  title,
  desc,
  value,
  onChange,
  onNext,
}: {
  title: string;
  desc: string;
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-totally-gothic text-[#ffcc00]">{title}</h2>
      <p className="text-sm text-[#ded7f0]/80">{desc}</p>
      <textarea
        className="w-full bg-black/80 border border-[#d4af37]/50 rounded p-4 min-h-[130px] outline-none focus:border-[#39ff14] transition-all text-white font-sans text-sm"
        placeholder="Record your memory into the Konran ledger..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={onNext}
        className="w-full bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37] text-[#ffcc00] hover:text-white font-mono uppercase tracking-wider text-xs font-bold py-3 rounded transition-all cursor-pointer"
      >
        Confirm &amp; Continue
      </button>
    </div>
  );
}

export default FatedQuestionnaire;
