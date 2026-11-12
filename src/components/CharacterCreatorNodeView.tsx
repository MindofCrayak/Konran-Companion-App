import React, { useState } from 'react';
import { 
  UserPlus, 
  Sparkles, 
  GraduationCap, 
  Check, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  ScrollText,
  Download,
  Award,
  Crown,
  Heart,
  Shield,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { QUESTIONS } from '../data/questions';
import { DEITIES, DEITY_IDS } from '../data/deities';
import { NyneDeityId, KAMPHouseId, CharacterProfile, MechanicalBoon, QuizScores } from '../types';
import { KAMP_PATH_DATA, KAMPCoreHouse } from './KAMPSortingQuiz';
import { trigger5eSheetDownload } from '../utils/feFileDownload';
import { CharacterExportPayload } from '../types/feExport';
import { playDivineReveal, playKeyClick, playOptionSelect } from '../utils/audio';

const CHOSEN_RACES = [
  { name: 'FlameForged', deity: 'Oray', desc: 'Living draconic fire and volcanic crystal-infused smiths', bonus: '+2 STR, +1 CON' },
  { name: 'Wyse Elves', deity: 'Lyricia', desc: 'Masters of knowledge, commerce, and astral libraries', bonus: '+2 INT, +1 WIS' },
  { name: 'Cecaelia', deity: 'Ousava', desc: 'Gentle aquatic elementalists of the coral kelp groves', bonus: '+2 WIS, +1 CHA' },
  { name: 'Ceall', deity: 'Celeste', desc: 'Noble warriors, tacticians, and sororal guardians', bonus: '+2 STR, +1 CHA' },
  { name: 'Fortuna', deity: 'Ay', desc: 'Ethereal weavers connected directly to the threads of fate', bonus: '+2 CHA, +1 DEX' },
  { name: 'InkBorne', deity: 'Psyon', desc: 'Beings etched of shifting fluid reality and chaos', bonus: '+2 DEX, +1 INT' },
  { name: 'Skree', deity: 'Krayvuk', desc: 'Subterranean trench observers of space, time, and necrotek', bonus: '+2 CON, +1 INT' },
  { name: 'Apex', deity: 'Slavyna', desc: 'Demonic-blooded lords of secrets, passion, and undercrust society', bonus: '+2 CHA, +1 STR' },
  { name: 'Kytans', deity: 'Kayzoku', desc: 'Cunning tricksters, fortune-seekers, and acrobatic monks', bonus: '+2 DEX, +1 WIS' },
  { name: 'Human', deity: 'Freeborn', desc: 'Adaptable travelers of the post-Fall continent', bonus: '+1 to all ability scores' },
  { name: 'Dwarf', deity: 'Freeborn', desc: 'Stonecraft and deep cavern engineers', bonus: '+2 CON, +1 STR' },
  { name: 'Dragonborn', deity: 'Freeborn', desc: 'Proud scaled lineages of ancient draconic empires', bonus: '+2 STR, +1 CHA' },
];

const DND_CLASSES = [
  'Wizard', 'Fighter', 'Rogue', 'Cleric', 'Paladin', 'Bard', 
  'Druid', 'Ranger', 'Sorcerer', 'Warlock', 'Monk', 'Barbarian', 'Artificer'
];

interface CharacterCreatorNodeViewProps {
  onCharacterCreated?: () => void;
}

type WizardStage = 
  | 'welcome' 
  | 'nyne_quiz' 
  | 'nyne_results' 
  | 'character_forge' 
  | 'fated_inquiry' 
  | 'kamp_inquiry' 
  | 'kamp_acceptance' 
  | 'kamp_sorting' 
  | 'complete';

export const CharacterCreatorNodeView: React.FC<CharacterCreatorNodeViewProps> = ({
  onCharacterCreated,
}) => {
  const { createCharacter, setActiveCharacterId, account } = useCharacter();

  // Wizard Stage
  const [stage, setStage] = useState<WizardStage>('welcome');

  // Step 1: Nyne Declaration Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScores, setQuizScores] = useState<QuizScores>({
    Lyricia: 0,
    Oray: 0,
    Ousava: 0,
    Ay: 0,
    Kayzoku: 0,
    Celeste: 0,
    Psyon: 0,
    Krayvuk: 0,
    Slavyna: 0,
  });
  const [declaredPatron, setDeclaredPatron] = useState<NyneDeityId>('Oray');

  // Step 2: Character Persona & Stats Forge
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('Wizard');
  const [species, setSpecies] = useState('FlameForged');
  const [level, setLevel] = useState(1);
  const [alignment, setAlignment] = useState<'LG'|'LN'|'NG'|'TN'|'CN'|'CG'|'CE'|'NE'|'LE'>('NG');
  const [stats, setStats] = useState({
    str: 10,
    dex: 14,
    con: 14,
    int: 16,
    wis: 12,
    cha: 10,
  });

  // Step 3: Fated Lifepath
  const [completedFatedNow, setCompletedFatedNow] = useState(false);
  const [fatedAspect, setFatedAspect] = useState('The Arcanist');
  const [fatedSect, setFatedSect] = useState('Keepers of the Leyline');

  // Step 4: KAMP Acceptance & Sorting
  const [isKampAccepted, setIsKampAccepted] = useState<boolean | null>(null);
  const [kampHouse, setKampHouse] = useState<KAMPCoreHouse>('Hydra');
  const [elective, setElective] = useState('HYD-215: Arcane Archaeology');
  const [advisor, setAdvisor] = useState('Arch-Magus Vorinth');

  // Created Character
  const [createdCharId, setCreatedCharId] = useState<string | null>(null);

  // --- Handlers: Nyne Quiz ---
  const handleAnswerQuestion = (deities: string[]) => {
    playOptionSelect();
    const updated = { ...quizScores };
    deities.forEach(d => {
      if (updated[d] !== undefined) {
        updated[d] = (updated[d] || 0) + 3;
      }
    });
    setQuizScores(updated);

    if (quizIndex < Math.min(8, QUESTIONS.length - 1)) {
      setQuizIndex(prev => prev + 1);
    } else {
      // Calculate top deity
      let topDeity: NyneDeityId = 'Oray';
      let highest = -1;
      (Object.keys(updated) as NyneDeityId[]).forEach(d => {
        if (updated[d] > highest) {
          highest = updated[d];
          topDeity = d;
        }
      });
      setDeclaredPatron(topDeity);
      playDivineReveal();
      setStage('nyne_results');
    }
  };

  // --- Handlers: Final Creation ---
  const handleFinalizeCreation = () => {
    playDivineReveal();

    const patronData = DEITIES[declaredPatron];
    const kampData = isKampAccepted ? KAMP_PATH_DATA[kampHouse] : null;

    const newChar: Partial<CharacterProfile> = {
      name: name.trim() || 'Fated Operative',
      characterClass,
      level,
      species,
      dndAlignment: alignment,
      declaredDeity: declaredPatron,
      deityDevotionTier: 1,
      deityBoon: {
        id: `boon_patron_${declaredPatron.toLowerCase()}`,
        name: patronData.divineBoon.name,
        sourceType: 'deity_patron',
        sourceName: `${declaredPatron}, ${patronData.title}`,
        description: patronData.divineBoon.description,
        dndMechanic: patronData.divineBoon.dndMechanic,
        actionType: 'reaction',
        recharge: 'short_rest',
      },
      hasCompletedDeityTrial: true,
      hasCompletedKAMPTrial: !!isKampAccepted,
      quizScores,
      stats: {
        ...stats,
        hpCurrent: 10 + Math.floor((stats.con - 10) / 2) + (level - 1) * 6,
        hpMax: 10 + Math.floor((stats.con - 10) / 2) + (level - 1) * 6,
        tempHp: 0,
        ac: 10 + Math.floor((stats.dex - 10) / 2),
        speed: 30,
        proficiencyBonus: Math.floor((level - 1) / 4) + 2,
        initiativeBonus: Math.floor((stats.dex - 10) / 2),
        goldGp: 150,
        hitDice: `${level}d8`,
      },
      kampProfile: {
        attended: !!isKampAccepted,
        houseId: isKampAccepted ? kampHouse : undefined,
        houseName: isKampAccepted ? `House ${kampHouse}` : undefined,
        houseAdvisor: isKampAccepted ? advisor : undefined,
        primaryElective: isKampAccepted ? elective : undefined,
        academicStanding: 'Good Standing',
        yearOfStudy: 'First-Year',
        majorDiscipline: kampData ? kampData.majorDiscipline : 'Independent Study',
        dormitory: kampData ? kampData.dormitory : 'Off-Campus',
        houseBoon: kampData ? kampData.boon : undefined,
      },
      factions: [],
      reputation: {},
      endorsements: [],
      playerNotes: {},
      inventory: [
        {
          id: `item_starter_1`,
          name: 'ObsydianHeart Biometric Slablet',
          category: 'Magitech',
          quantity: 1,
          description: 'Personal crystalline slate loaded with Konra/Nyne OS v4.2 and Fated biometric registration.',
        },
        {
          id: `item_starter_2`,
          name: 'Liturgical Covenant Ring',
          category: 'Relic',
          quantity: 1,
          description: `Consecrated to ${declaredPatron}. Glows faintly when leyline resonance spikes.`,
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (completedFatedNow) {
      newChar.hasCompletedLifepath = true;
      newChar.lifepath = {
        primaryDeity: declaredPatron,
        aspect: fatedAspect,
        aspectMods: '+1 Insight, +1 Arcana, +1 Saving Throws',
        sect: fatedSect,
        sectDesc: 'Dedicated to upholding the ancient treaties and cosmic balance of Konran.',
        secondDeity: 'Lyricia',
        thirdDeity: 'Ay',
        divineEnemy: 'Psyon',
        specialAbilities: 'Fated Intuition: Advantage on one death saving throw or initiative check per dawn.',
        interests: 'Ancient planar runes, Vertazyum clockwork, trade contracts.',
        sectStanding: 'Adherent',
        fateView: 'Destiny is an unyielding tapestry woven by Ay and carved by the gods.',
        greatDeed: 'Survived The Passing and channeled raw ley currents without disintegrating.',
        previousLife: 'Astrolabe scholar in the Third Age of Arcane Wonder.',
        familyTies: 'Orphaned during the Leyline Convergence; adopted by a wandering merchant.',
        perfectDeath: 'Defending the Prime Law of Konran with a spell on my lips.',
        fateScore: 18,
        fameScore: 12,
        favorScore: 24,
        completedAt: new Date().toISOString(),
      };
    }

    const created = createCharacter(newChar as unknown as Omit<CharacterProfile, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>);
    setCreatedCharId(created.id || 'new_character');
    setStage('complete');
  };

  // --- Handlers: Trigger 5e Mobile Sheet Download ---
  const handleDownload5eJson = () => {
    playDivineReveal();
    const patronData = DEITIES[declaredPatron];
    const kampData = isKampAccepted ? KAMP_PATH_DATA[kampHouse] : null;

    const payload: CharacterExportPayload = {
      name: name.trim() || 'Fated Operative',
      raceName: species,
      raceFeaturesText: `${species} Heritage: ${CHOSEN_RACES.find(r => r.name === species)?.desc || 'Native lineage of Konran'}. Stat Traits: ${CHOSEN_RACES.find(r => r.name === species)?.bonus || '+1 to all stats'}.`,
      backgroundName: isKampAccepted ? `K.A.M.P. House ${kampHouse} Adept` : 'Fated Wanderer',
      backgroundFeaturesText: isKampAccepted && kampData 
        ? `${kampData.boon.name}: ${kampData.boon.description} (${kampData.boon.dndMechanic}). Advisor: ${advisor}. Elective: ${elective}.` 
        : 'Wanders the free continent of Konran under the Prime Law of Sentience.',
      classes: [
        {
          name: characterClass,
          level,
          hitDie: 8,
          featuresText: `${patronData.divineBoon.name} (${declaredPatron}): ${patronData.divineBoon.description} [${patronData.divineBoon.dndMechanic}].` + (completedFatedNow ? `\nFated Lifepath (${fatedAspect} // ${fatedSect}): +1 Insight, +1 Arcana, Fated Intuition.` : ''),
        }
      ],
      stats: {
        str: stats.str,
        dex: stats.dex,
        con: stats.con,
        int: stats.int,
        wis: stats.wis,
        cha: stats.cha,
      },
      savingThrowProficiencies: {
        str: characterClass === 'Fighter' || characterClass === 'Barbarian',
        dex: characterClass === 'Rogue' || characterClass === 'Monk',
        con: characterClass === 'Barbarian' || characterClass === 'Sorcerer',
        int: characterClass === 'Wizard' || characterClass === 'Artificer',
        wis: characterClass === 'Cleric' || characterClass === 'Druid',
        cha: characterClass === 'Bard' || characterClass === 'Paladin' || characterClass === 'Warlock',
      },
      hp: {
        current: 10 + Math.floor((stats.con - 10) / 2) + (level - 1) * 6,
        max: 10 + Math.floor((stats.con - 10) / 2) + (level - 1) * 6,
        temp: 0,
      },
      speed: 30 + (isKampAccepted && kampHouse === 'Gryffon' ? 10 : 0),
      armorClass: 10 + Math.floor((stats.dex - 10) / 2),
      proficiencies: {
        armor: 'Light Armor, Medium Armor, Shields',
        weapons: 'Simple Weapons, Martial Weapons',
        tools: isKampAccepted && kampHouse === 'Spynx' ? "Tinker's Tools, Alchemist's Supplies" : "Thieves' Tools, Magitech Focus",
        languages: 'Common, Celestial, Draconic, Primordial',
      },
      inventory: [
        'ObsydianHeart Biometric Slablet Mk IV (Magitech Focus)',
        `Liturgical Covenant Ring of ${declaredPatron} (Relic)`,
        ...(isKampAccepted ? [`K.A.M.P. House ${kampHouse} Uniform & Insignia`, `Syllabus: ${elective}`] : []),
        'Adventurer’s Pack (rations, waterskin, 50ft silk rope)',
      ],
    };

    trigger5eSheetDownload(payload);
  };

  const currentQ = QUESTIONS[quizIndex];

  return (
    <div className="w-full h-full flex flex-col bg-[#070b08] text-white font-mono text-xs overflow-y-auto p-4 sm:p-6 space-y-4 select-text">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#39ff14]/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#39ff14] animate-pulse" />
          <div>
            <h2 className="font-bold text-[#39ff14] uppercase tracking-wider text-sm flex items-center gap-2">
              <span>Fated Persona Genesis // Guided Enrollment Protocol</span>
            </h2>
            <p className="text-[10px] text-white/60">
              The Nyne Declaration &rarr; Persona Forge &rarr; Fated Questionnaire &rarr; K.A.M.P. Academy &rarr; 5e Export
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#39ff14]/15 border border-[#39ff14] text-[#39ff14] font-bold">
            STAGE: {stage.toUpperCase()}
          </span>
        </div>
      </div>

      {/* STAGE 0: WELCOME & INITIATION */}
      {stage === 'welcome' && (
        <div className="flex-1 flex flex-col justify-center items-center max-w-xl mx-auto text-center space-y-5 py-6">
          <div className="w-16 h-16 rounded-full bg-[#39ff14]/10 border-2 border-[#39ff14] flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.3)]">
            <UserPlus className="w-8 h-8 text-[#39ff14]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-wide font-serif">
              Welcome, Fated Traveler
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Every persona in Konran is reborn from great renown on one of the nine planes. 
              Before forging your 5.5e character sheet, you will undergo the <strong>Nyne Declaration Trial</strong> to reveal which of the Founding Gods guides your destiny, enroll your stats, and establish your K.A.M.P. Academy standing.
            </p>
          </div>

          <div className="p-3 bg-black/60 border border-white/10 rounded-lg text-left text-[11px] font-sans space-y-2 w-full text-stone-300">
            <div className="flex items-center gap-2 text-[#ffcc00] font-bold font-mono text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Genesis Pipeline Overview:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li><strong>Stage 1:</strong> The 9-Question Pantheon Declaration Quiz (unravels your Patron &amp; Boon)</li>
              <li><strong>Stage 2:</strong> Persona Forge (Species, 5.5e Class, Ability Modifiers, HP, AC)</li>
              <li><strong>Stage 3:</strong> Fated Lifepath Questionnaire (Aspect, Sect, and Destiny Buffs)</li>
              <li><strong>Stage 4:</strong> K.A.M.P. Academy Acceptance Letter &amp; House Sorting</li>
              <li><strong>Stage 5:</strong> Export direct to <em>Fifth Edition Character Sheet</em> mobile app (.json)</li>
            </ul>
          </div>

          <button
            onClick={() => {
              playOptionSelect();
              setStage('nyne_quiz');
            }}
            className="px-6 py-3 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border-2 border-[#39ff14] text-[#39ff14] font-bold text-sm tracking-widest uppercase rounded shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Begin The Nyne Declaration Quiz</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STAGE 1: THE NYNE DECLARATION QUIZ */}
      {stage === 'nyne_quiz' && currentQ && (
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-4 py-2">
          <div className="flex justify-between items-center text-[11px] text-white/50 border-b border-white/10 pb-2">
            <span>QUESTION {quizIndex + 1} OF 9 &bull; {currentQ.category}</span>
            <span className="text-[#39ff14] font-bold">{Math.round(((quizIndex + 1) / 9) * 100)}% COMPLETE</span>
          </div>

          <div className="p-4 bg-black/50 border border-white/20 rounded-lg">
            <h3 className="text-sm sm:text-base font-bold text-[#ffd700] font-serif leading-relaxed">
              "{currentQ.title}"
            </h3>
          </div>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerQuestion(opt.deities)}
                className="w-full text-left p-3.5 bg-black/60 hover:bg-[#39ff14]/15 border border-white/15 hover:border-[#39ff14] rounded-lg transition-all text-xs font-sans text-stone-200 hover:text-white cursor-pointer group flex items-start gap-3 shadow-sm"
              >
                <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-[#39ff14] group-hover:text-black flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5 transition-colors">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="leading-relaxed">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 1.5: NYNE RESULTS & COVENANT DECLARATION */}
      {stage === 'nyne_results' && (
        <div className="flex-1 max-w-xl mx-auto w-full text-center space-y-4 py-3">
          <div className="p-4 bg-gradient-to-b from-[#1c1204] to-black border-2 border-[#ffd700] rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.25)] space-y-3">
            <div className="text-[10px] tracking-[0.25em] text-[#ffd700]/70 uppercase font-mono">
              DIVINE TELEMETRY SYNCHRONIZED
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-[#ffd700] font-serif">
                {declaredPatron} // {DEITIES[declaredPatron].title}
              </h3>
              <p className="text-xs text-stone-300 font-sans italic">
                "{DEITIES[declaredPatron].desc}"
              </p>
            </div>

            <div className="p-3 bg-black/80 border border-[#ffd700]/40 rounded text-left space-y-1.5 font-sans">
              <div className="text-xs font-bold text-[#39ff14] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Patron Boon: {DEITIES[declaredPatron].divineBoon.name}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {DEITIES[declaredPatron].divineBoon.description}
              </p>
              <div className="text-[10px] font-mono text-[#ffd700] bg-[#ffd700]/10 p-1.5 rounded border border-[#ffd700]/30">
                <strong>D&amp;D 5.5e Mechanic:</strong> {DEITIES[declaredPatron].divineBoon.dndMechanic}
              </div>
            </div>

            {/* Change Patron Dropdown if they feel another fits better */}
            <div className="text-left pt-2 border-t border-white/10 flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Desire another patron?</span>
              <select
                value={declaredPatron}
                onChange={(e) => {
                  playOptionSelect();
                  setDeclaredPatron(e.target.value as NyneDeityId);
                }}
                className="bg-black border border-white/30 rounded px-2 py-1 text-[#ffd700] text-xs font-mono"
              >
                {DEITY_IDS.map(d => (
                  <option key={d} value={d}>{d} ({DEITIES[d].title})</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              playOptionSelect();
              setStage('character_forge');
            }}
            className="w-full py-3 bg-[#ffd700]/20 hover:bg-[#ffd700]/30 border-2 border-[#ffd700] text-[#ffd700] font-bold text-sm tracking-wider uppercase rounded shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Affirm Covenant &amp; Forge Persona Stats</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STAGE 2: CHARACTER FORGE & STATS */}
      {stage === 'character_forge' && (
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-4 py-2">
          <div className="border-b border-white/10 pb-2 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#39ff14] font-mono uppercase tracking-wide flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Step 2: Bio-Crystal Persona &amp; Ability Scores</span>
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">Bound to {declaredPatron}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] text-[#ffcc00] font-bold">Character Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kaelen of the Ashen Spires"
                className="w-full px-3 py-2 bg-black border border-white/30 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#ffcc00] font-bold">Level</label>
              <input
                type="number"
                min={1}
                max={20}
                value={level}
                onChange={(e) => setLevel(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-black border border-white/30 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#ffcc00] font-bold">Chosen Konran Species / Race</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/30 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
              >
                {CHOSEN_RACES.map(r => (
                  <option key={r.name} value={r.name}>{r.name} ({r.deity}) &bull; {r.bonus}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#ffcc00] font-bold">D&amp;D 5.5e Class</label>
              <select
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/30 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
              >
                {DND_CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ability Scores Input */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#39ff14] font-bold uppercase tracking-wider">Base Ability Scores (5.5e)</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setStats({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 })}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-stone-300 cursor-pointer"
                >
                  Standard Array
                </button>
                <button
                  type="button"
                  onClick={() => setStats({ str: 10, dex: 16, con: 14, int: 16, wis: 12, cha: 10 })}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-stone-300 cursor-pointer"
                >
                  Caster Array
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(statKey => (
                <div key={statKey} className="p-2 bg-black/60 border border-white/20 rounded text-center">
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">{statKey}</span>
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={stats[statKey]}
                    onChange={(e) => setStats({ ...stats, [statKey]: parseInt(e.target.value) || 10 })}
                    className="w-full text-center bg-transparent text-[#ffd700] font-bold text-sm focus:outline-none"
                  />
                  <span className="block text-[9px] text-stone-500">
                    {Math.floor((stats[statKey] - 10) / 2) >= 0 ? `+${Math.floor((stats[statKey] - 10) / 2)}` : Math.floor((stats[statKey] - 10) / 2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-white/10">
            <button
              onClick={() => setStage('nyne_results')}
              className="px-4 py-2 border border-white/20 text-stone-400 hover:text-white rounded text-xs cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!name.trim()) {
                  setName('Aurelius of Konran');
                }
                playOptionSelect();
                setStage('fated_inquiry');
              }}
              className="px-5 py-2 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border border-[#39ff14] text-[#39ff14] font-bold rounded text-xs cursor-pointer flex items-center gap-2"
            >
              <span>Continue to Fated Lifepath</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: FATED LIFEPATH INQUIRY */}
      {stage === 'fated_inquiry' && (
        <div className="flex-1 max-w-xl mx-auto w-full text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-full bg-[#ffcc00]/10 border-2 border-[#ffcc00] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,204,0,0.3)]">
            <ScrollText className="w-7 h-7 text-[#ffcc00]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-[#ffcc00] font-serif">
              Step 3: Questionnaire of the Fated
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Every persona in Konran possesses a deeper cosmic lifepath: an Aspect of their God, a clandestine Sect, a divine nemesis, and past-life deed.
            </p>
          </div>

          <div className="p-3 bg-black/60 border border-white/10 rounded text-left text-xs font-sans space-y-3">
            <div className="text-stone-300">
              <span className="text-[#39ff14] font-bold">Quick Inscription:</span> Select your Aspect &amp; Sect now to gain immediate Fated buffs, or launch the in-depth 15-question questionnaire later.
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <label className="block text-stone-400 mb-0.5">Celestial Aspect:</label>
                <input
                  type="text"
                  value={fatedAspect}
                  onChange={(e) => setFatedAspect(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-0.5">Sect Affiliation:</label>
                <input
                  type="text"
                  value={fatedSect}
                  onChange={(e) => setFatedSect(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-white/20 rounded text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              onClick={() => {
                setCompletedFatedNow(true);
                playOptionSelect();
                setStage('kamp_inquiry');
              }}
              className="px-5 py-2.5 bg-[#ffcc00]/20 hover:bg-[#ffcc00]/30 border border-[#ffcc00] text-[#ffcc00] font-bold text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Fated Lifepath Buffs</span>
            </button>
            <button
              onClick={() => {
                setCompletedFatedNow(false);
                playOptionSelect();
                setStage('kamp_inquiry');
              }}
              className="px-4 py-2 text-stone-400 hover:text-white text-xs cursor-pointer"
            >
              Skip (Complete Later)
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: KAMP INQUIRY */}
      {stage === 'kamp_inquiry' && (
        <div className="flex-1 max-w-xl mx-auto w-full text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-full bg-[#7f1d1d]/30 border-2 border-[#ef4444] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <GraduationCap className="w-7 h-7 text-[#ef4444]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white font-serif">
              Step 4: Academic Registry of K.A.M.P.
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Did you receive an official acceptance letter to the <strong>Konran Academy of Magitech &amp; Psionics (K.A.M.P.)</strong> for the 2483rd Academic Year?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setIsKampAccepted(true);
                playDivineReveal();
                setStage('kamp_acceptance');
              }}
              className="p-4 rounded-lg bg-[#7f1d1d]/20 hover:bg-[#7f1d1d]/40 border-2 border-[#ef4444] text-white flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all shadow-md group"
            >
              <Award className="w-6 h-6 text-[#ef4444] group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs uppercase tracking-wide text-[#ef4444]">
                Yes // Accepted to K.A.M.P.
              </div>
              <div className="text-[10px] text-stone-300 font-sans">
                Review official Acceptance Letter, complete House Sorting, and receive Academy Mechanical Boons.
              </div>
            </button>

            <button
              onClick={() => {
                setIsKampAccepted(false);
                playOptionSelect();
                handleFinalizeCreation();
              }}
              className="p-4 rounded-lg bg-black/60 hover:bg-white/10 border border-white/20 text-white flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all shadow-md"
            >
              <Shield className="w-6 h-6 text-stone-400" />
              <div className="font-bold text-xs uppercase tracking-wide text-stone-300">
                No // Independent Fated
              </div>
              <div className="text-[10px] text-stone-400 font-sans">
                You travel the continent as an unbound adventurer, guild contractor, or freelance arcane mercenary.
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4.5: OFFICIAL KAMP ACCEPTANCE LETTER */}
      {stage === 'kamp_acceptance' && (
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-4 py-2">
          {/* Parchment Styled Acceptance Letter */}
          <div className="p-6 bg-[#1a140c] border-2 border-[#d4af37] rounded-xl text-[#d4af37] font-serif shadow-2xl relative space-y-4">
            <div className="flex justify-between items-start border-b border-[#7d561a]/60 pb-3">
              <div>
                <div className="text-[10px] font-mono tracking-[0.2em] text-[#d4af37]/70 uppercase">
                  OFFICE OF THE DEAN &bull; ADMISSIONS COUNCIL
                </div>
                <h3 className="text-lg font-bold text-[#ffd700]">
                  Konran Academy of Magitech &amp; Psionics
                </h3>
                <div className="text-[11px] text-stone-400 font-sans">
                  Mount Kraykay &bull; Founders Quadrangle &bull; Year 2483 of the Third Age
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] flex items-center justify-center bg-[#291708] text-[#ffd700] text-[9px] font-mono font-bold text-center leading-tight shadow-inner">
                K.A.M.P.<br/>SEAL
              </div>
            </div>

            <div className="text-xs font-sans text-stone-200 leading-relaxed space-y-2">
              <p>
                <strong>To Adept {name || 'Candidate'}:</strong>
              </p>
              <p>
                It is our distinct privilege to inform you that your planar resonance and devotion to <strong>{declaredPatron}</strong> have fulfilled the exacting standards of the Admissions Directorate. You are hereby granted provisional admittance to the <strong>2483rd Matriculation Class</strong>.
              </p>
              <p>
                Please report directly to the Sorting Pavilion to submit your evaluation for House Placement (<em>Gryffon, Spynx, Hydra, or Unycorn</em>) and register your initial course schedule.
              </p>
            </div>

            <div className="pt-2 border-t border-[#7d561a]/40 flex justify-between items-center text-[11px] text-stone-400 font-sans">
              <span>By Order of: Arch-Rector Theron Voss</span>
              <span className="text-[#39ff14] font-mono font-bold">STATUS: ADMISSION VERIFIED</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                playOptionSelect();
                setStage('kamp_sorting');
              }}
              className="px-6 py-2.5 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border-2 border-[#ef4444] text-[#ef4444] font-bold text-xs rounded tracking-wider uppercase cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <span>Proceed to House Sorting &amp; Curriculum</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4.6: KAMP SORTING & SCHEDULE */}
      {stage === 'kamp_sorting' && (
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-4 py-2">
          <div className="border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-[#ef4444] font-mono uppercase tracking-wide flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>K.A.M.P. House Sorting &amp; Schedule Planning</span>
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* House Selection */}
            <div>
              <label className="block text-[#ffcc00] font-bold mb-1.5 text-[11px]">Select Your Academy House:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['Hydra', 'Gryffon', 'Spynx', 'Unycorn'] as KAMPCoreHouse[]).map(h => {
                  const data = KAMP_PATH_DATA[h];
                  const isSelected = kampHouse === h;
                  return (
                    <div
                      key={h}
                      onClick={() => {
                        playOptionSelect();
                        setKampHouse(h);
                      }}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#ef4444]/20 border-[#ef4444] text-white shadow-md' 
                          : 'bg-black/50 border-white/15 text-stone-400 hover:border-white/40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-[#ffd700]">House {h}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#39ff14]" />}
                      </div>
                      <p className="text-[10px] font-sans text-stone-300 leading-snug">
                        {data.majorDiscipline}
                      </p>
                      <div className="mt-1.5 text-[9px] text-[#39ff14] font-mono">
                        Boon: {data.boon.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Curriculum Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-stone-300 mb-1 text-[11px]">Primary Elective Course:</label>
                <input
                  type="text"
                  value={elective}
                  onChange={(e) => setElective(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-white/20 rounded text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1 text-[11px]">Faculty Advisor:</label>
                <input
                  type="text"
                  value={advisor}
                  onChange={(e) => setAdvisor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-white/20 rounded text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-white/10">
            <button
              onClick={() => setStage('kamp_acceptance')}
              className="px-4 py-2 border border-white/20 text-stone-400 hover:text-white rounded text-xs cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinalizeCreation}
              className="px-6 py-2.5 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border-2 border-[#39ff14] text-[#39ff14] font-bold rounded text-xs cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Finalize Persona &amp; Mount to Matrix</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: COMPLETED PERSONA & 5E EXPORT */}
      {stage === 'complete' && (
        <div className="flex-1 max-w-xl mx-auto w-full text-center space-y-4 py-3">
          <div className="p-4 bg-black/80 border-2 border-[#39ff14] rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.25)] space-y-3">
            <div className="text-[10px] tracking-[0.25em] text-[#39ff14] uppercase font-mono font-bold">
              PERSONA MATRIX ENGAGED &bull; ACTIVE SLABLET CONTEXT
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-serif">
                {name || 'Fated Operative'}
              </h3>
              <p className="text-xs text-[#ffd700] font-mono">
                Level {level} {species} &bull; {characterClass} &bull; {declaredPatron} Adherent
              </p>
            </div>

            <div className="p-3 bg-[#110a05] border border-[#7d561a] rounded text-left space-y-2 text-xs font-sans text-stone-300">
              <div className="flex justify-between items-center text-[11px] border-b border-[#7d561a]/40 pb-1">
                <span className="text-stone-400">Patron Boon:</span>
                <span className="text-[#ffd700] font-bold">{DEITIES[declaredPatron].divineBoon.name}</span>
              </div>
              {completedFatedNow && (
                <div className="flex justify-between items-center text-[11px] border-b border-[#7d561a]/40 pb-1">
                  <span className="text-stone-400">Fated Standing:</span>
                  <span className="text-[#39ff14]">{fatedAspect} // {fatedSect}</span>
                </div>
              )}
              {isKampAccepted && (
                <div className="flex justify-between items-center text-[11px] border-b border-[#7d561a]/40 pb-1">
                  <span className="text-stone-400">K.A.M.P. House:</span>
                  <span className="text-[#ef4444] font-bold">House {kampHouse} (Boon: {KAMP_PATH_DATA[kampHouse].boon.name})</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-stone-400">Attributes:</span>
                <span className="font-mono text-[10px] text-stone-200">
                  STR {stats.str} | DEX {stats.dex} | CON {stats.con} | INT {stats.int} | WIS {stats.wis} | CHA {stats.cha}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={handleDownload5eJson}
              className="px-5 py-3 bg-[#291708] border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#3d240e] rounded text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to 5e Character Sheet (.json)</span>
            </button>

            <button
              onClick={() => {
                playOptionSelect();
                if (onCharacterCreated) onCharacterCreated();
              }}
              className="px-5 py-3 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border-2 border-[#39ff14] text-[#39ff14] font-bold text-xs tracking-wider uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Enter Konran Spatial OS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
