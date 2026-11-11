import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Download,
  X,
  BookOpen,
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { KAMPHouseId, MechanicalBoon } from '../types';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';

export type KAMPCoreHouse = 'Gryffon' | 'Spynx' | 'Hydra' | 'Unycorn';

export const KAMP_PATH_DATA: Record<
  KAMPCoreHouse,
  {
    continuation: string;
    secTrack: string;
    capstone: string;
    dormitory: string;
    majorDiscipline: string;
    boon: MechanicalBoon;
  }
> = {
  Gryffon: {
    continuation: 'GRY-202: Advanced Combat (A) OR GRY-210: Zyng! Practicum (A)',
    secTrack: 'Frontier Patrol Lead',
    capstone: 'GRY-300: Tactical Mastery (M) OR SPH-320: Fauna & Mutation (M)',
    dormitory: 'Aether Vaults, Twr III (4B)',
    majorDiscipline: 'Martial Prowess, Tactical Combat & Frontier Security',
    boon: {
      id: 'boon_kamp_gryffon_vanguard',
      name: 'Gryffon Tactical Vanguard',
      sourceType: 'kamp_house',
      sourceName: 'K.A.M.P. House Gryffon',
      description: 'Trained in squad cohesion, perimeter defense, and Zyng arena footwork.',
      dndMechanic: '+10 ft movement speed on the first turn of combat and +1d6 Tactical Superiority Die once per short rest.',
      actionType: 'bonus_action',
      usesMax: 1,
      usesRemaining: 1,
      recharge: 'short_rest',
    },
  },
  Spynx: {
    continuation: 'SPH-201: Info VR Systems (A) OR DIV-250: Divination Studies (A)',
    secTrack: 'Magitech Lab TA',
    capstone: 'SPH-330: Astrophysics & Realm Traversal (M) OR SPH-320: Fauna Mutation (M)',
    dormitory: 'Vertazyum Observatory, Twr II (2A)',
    majorDiscipline: 'CrystalPunk Tinkering, Alchemy & Technical Research',
    boon: {
      id: 'boon_kamp_spynx_tinker',
      name: 'Spynx Magitech Calibration',
      sourceType: 'kamp_house',
      sourceName: 'K.A.M.P. House Spynx',
      description: 'Mastery over Vertazyum micro-gears, optical Googgles, and alchemical analysis.',
      dndMechanic: "Proficiency with Tinker's Tools & Alchemist's Supplies; add +1d4 to Investigation or Arcana checks made on magitech or flora/fauna.",
      actionType: 'passive',
      recharge: 'at_will',
    },
  },
  Hydra: {
    continuation: 'HYD-215: Arcane Archaeology (A) OR HYD-220: Applied Necromancy (A)',
    secTrack: 'Ward & Shield Maintenance',
    capstone: 'HYD-350: Mind-Forging & Psionic Metallurgy (M) OR HRT-300: Grand Artifact Crafting (M)',
    dormitory: 'Sanctum of Ley-Wards, Twr I (6C)',
    majorDiscipline: 'Arcane Precision, Psionic Discipline & Planar Magic',
    boon: {
      id: 'boon_kamp_hydra_focus',
      name: 'Hydra Arcane & Psionic Precision',
      sourceType: 'kamp_house',
      sourceName: 'K.A.M.P. House Hydra',
      description: 'Mental composure and spell-weaving precision forged in the Hydra sanctums.',
      dndMechanic: '+1 to Spell Attack rolls and Advantage on Constitution saving throws made to maintain Concentration.',
      actionType: 'passive',
      recharge: 'at_will',
    },
  },
  Unycorn: {
    continuation: 'UNI-202: Masquerade Pageantry (A) OR UNI-210: Subterfuge & Leadership (A)',
    secTrack: 'Masquerade Audition Prep',
    capstone: 'UNI-300: Virtuoso Performance (M) OR LEG-300: Corporate Pacts (M)',
    dormitory: 'Velvet Masquerade Pavilion (Suite 9)',
    majorDiscipline: 'Acoustic Theory, Subterfuge & Masquerade Pageantry',
    boon: {
      id: 'boon_kamp_unycorn_flair',
      name: 'Unycorn Virtuoso Flair',
      sourceType: 'kamp_house',
      sourceName: 'K.A.M.P. House Unycorn',
      description: 'Theatrical misdirection, acoustic resonance, and roguish unpredictability.',
      dndMechanic: 'Reaction: Add +1d6 to a Performance, Deception, or Sleight of Hand check, or impose -1d6 on an enemy attack roll via theatrical distraction (2/short rest).',
      actionType: 'reaction',
      usesMax: 2,
      usesRemaining: 2,
      recharge: 'short_rest',
    },
  },
};

export const KAMP_ADVISORS: Record<KAMPCoreHouse, { house: string; faculty: string }> = {
  Gryffon: { house: 'Cmdr. Lysander Lyteheart', faculty: 'Coach Thrain Ironarm' },
  Spynx: { house: 'Prof. Yvctus', faculty: 'Aukymba (Mother)' },
  Hydra: { house: 'Lady Byon', faculty: 'Tao (Primadonna)' },
  Unycorn: { house: 'Flaryotta', faculty: 'Shade' },
};

export interface KAMPCourseDetail {
  code: string;
  title: string;
  instructor: string;
  place: string;
  fullString?: string;
  desc: string;
  bonus55e: string;
  credits: number;
}

export const KAMP_COURSE_DETAILS: Record<string, KAMPCourseDetail> = {
  CORE101: {
    code: 'CORE101',
    title: 'SURVIVALISM & KODEX OATH',
    instructor: 'S. Satysfaction',
    place: 'WLD-01',
    desc: 'Foundational wilderness survival and binding initiation to the Kodex.',
    bonus55e: 'Advantage on Survival checks in the Thyrst River Basin.',
    credits: 6,
  },
  CORE103: {
    code: 'CORE103',
    title: 'LIFE, CULTURES & ETHICS',
    instructor: 'E. Starflower',
    place: 'TWR-02',
    desc: 'Inter-species customs, diplomacy, and navigating societal morality.',
    bonus55e: '+1 Insight & Persuasion when parleying with Konran factions.',
    credits: 4,
  },
  CORE104: {
    code: 'CORE104',
    title: 'HISTORY & APPLIED TACTICS',
    instructor: 'Prof. Yvctus',
    place: 'TWR-04',
    desc: 'Analysis of past conflicts, strategy, and theoretical Zyng rules.',
    bonus55e: '+1 History & Initiative rolls during squad engagements.',
    credits: 4,
  },
  CORE105: {
    code: 'CORE105',
    title: 'MARTIAL PRACTICE & ARENA',
    instructor: 'T. Ironarm',
    place: 'GL-01',
    desc: 'Physical conditioning, squad cohesion, and defensive combat forms.',
    bonus55e: '+1 Athletics & +5 Max HP conditioning.',
    credits: 4,
  },
  CORE106: {
    code: 'CORE106',
    title: 'CELESTIAL NAVIGATION 101',
    instructor: 'Olloppa',
    place: 'LGH-TS',
    desc: 'Nighttime star-mapping, ether tracking, and nocturnal awareness.',
    bonus55e: 'Nocturnal navigation mastery under Olysphere & Ayanath.',
    credits: 4,
  },
  'GRY-101': {
    code: 'GRY-101',
    title: 'FIELD SECURITY & FRONTIER PATROL',
    instructor: 'C. Lyteheart',
    place: 'GRY-047',
    fullString: 'GRY-101: Field Security & Frontier Patrol (B)',
    desc: 'Master perimeter defense protocols and practical beast deterrence.',
    bonus55e: '+10 ft speed & Combat Superiority Die (1d6).',
    credits: 4,
  },
  'SPH-110': {
    code: 'SPH-110',
    title: 'INTRO TO TINKERING & MAGITECH',
    instructor: 'G. Smoothsmyth',
    place: 'SPH-032',
    fullString: 'SPH-110: Intro to Tinkering & Magitech Systems (B)',
    desc: 'CrystalPunk engineering, wiring mana cells, and servicing gear.',
    bonus55e: "Proficiency with Tinker's Tools & Infused Glyphs.",
    credits: 4,
  },
  'SPH-120': {
    code: 'SPH-120',
    title: 'FLORA & FAUNA STUDIES',
    instructor: 'Aukymba',
    place: 'SPH-027',
    fullString: 'SPH-120: Flora & Fauna Studies (B)',
    desc: 'Ecosystem cataloging, monster ID, and rare reagent harvesting.',
    bonus55e: '+1 Nature & Herbalism Kit reagent extraction.',
    credits: 4,
  },
  'HYD-101': {
    code: 'HYD-101',
    title: 'MAGIC BASICS & ARCANE PRECISION',
    instructor: 'L. Byon',
    place: 'HYD-245',
    fullString: 'HYD-101: Magic Basics & Arcane Precision (B)',
    desc: 'Spell-weaving principles, mana burnout, and somatic gesture precision.',
    bonus55e: '+1 Spell Attack rolls & Ritual Casting efficiency.',
    credits: 4,
  },
  'UNI-101': {
    code: 'UNI-101',
    title: 'ACOUSTIC THEORY & COMPOSITION',
    instructor: 'Flaryotta',
    place: 'UNI-151',
    fullString: 'UNI-101: Acoustic Theory & Musical Composition (B)',
    desc: 'Vocal projection, instrumental mastery, and morale-building cadence.',
    bonus55e: '+1 Performance & Bardic/Morale cadence aura.',
    credits: 4,
  },
  'UNI-110': {
    code: 'UNI-110',
    title: 'DECEPTION & SUBTERFUGE',
    instructor: 'Shade',
    place: 'UNI-249',
    fullString: 'UNI-110: Deception & Subterfuge (B)',
    desc: 'Sleight of hand, disguise, spotting scrying eyes, and security bypass.',
    bonus55e: '+1 Deception, Sleight of Hand & Scrying detection.',
    credits: 4,
  },
  'DIV-101': {
    code: 'DIV-101',
    title: 'DIVINE BASICS & FAITH CHANNELING',
    instructor: 'Tao / P. Kama',
    place: 'DIV-211',
    fullString: 'DIV-101: Divine Basics & Faith Channeling (B)',
    desc: 'Sacred spellcasting etiquette and learning the domains of the Emissaries.',
    bonus55e: '+1 Religion & Channel Divinity / Liturgical resonance.',
    credits: 4,
  },
  'LEG-110': {
    code: 'LEG-110',
    title: 'CIVIC RESPONSIBILITY & PHILANTHROPY',
    instructor: 'P. Kama',
    place: 'LEG-204',
    fullString: 'LEG-110: Civic Responsibility, Public Ethics & Philanthropy (B)',
    desc: 'Community organization, charity management, and settlement outreach.',
    bonus55e: '+1 Persuasion & Settlement Reputation standing.',
    credits: 4,
  },
  'HRT-101': {
    code: 'HRT-101',
    title: 'CULINARY ALCHEMY & HEARTH SCIENCE',
    instructor: 'I. Flamestove',
    place: 'HRT-204',
    fullString: 'HRT-101: Culinary Alchemy & Hearth Science (B)',
    desc: 'Elemental heating to turn raw field harvests into restorative rations.',
    bonus55e: 'Restorative Rations grant +1d8 Temp HP on Short Rest.',
    credits: 4,
  },
};

interface KAMPQuizOption {
  text: string;
  scores: Partial<Record<KAMPCoreHouse, number>>;
  electives: string[];
}

interface KAMPQuizQuestion {
  id: number;
  title: string;
  options: KAMPQuizOption[];
}

export const KAMP_QUESTIONS: KAMPQuizQuestion[] = [
  {
    id: 1,
    title:
      'You find a perfectly smooth, featureless black cube sitting in the middle of a crowded crosswalk. It smells faintly of vanilla. What do you do?',
    options: [
      {
        text: 'Report it as a potential environmental hazard, cordon off the area to protect civilians, and wait for clearance.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Carefully measure its dimensions, note the scent anomalies, and throw a small pebble at it to test for a kinetic barrier.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110'],
      },
      {
        text: "Close your eyes and try to 'listen' to the cube, reaching out with your mind to feel if it has a pulse or magical aura.",
        scores: { Hydra: 2, Unycorn: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'Lick it. If it smells like vanilla, maybe it tastes like vanilla. Only one way to find out.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-110'],
      },
    ],
  },
  {
    id: 2,
    title:
      'If you were forced to replace your left eye with a magical prosthetic that granted one specific vision, which would you choose?',
    options: [
      {
        text: 'The ability to instantly perceive the structural weak points in any physical object or defensive fortification.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101', 'GRY-101'],
      },
      {
        text: 'The ability to perceive the exact chemical makeup, temperature, and atomic structure of whatever I focus on.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110', 'SPH-110'],
      },
      {
        text: 'The ability to see the emotional auras and lingering spirits of those who have passed through a room.',
        scores: { Hydra: 2, Gryffon: 1 },
        electives: ['HYD-101', 'HYD-101'],
      },
      {
        text: 'The ability to see what people look like wearing their most embarrassing childhood outfit.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-101', 'UNI-101'],
      },
    ],
  },
  {
    id: 3,
    title:
      'A talking raven lands on your shoulder and tells you a terrible secret about a good friend. What is your immediate reaction?',
    options: [
      {
        text: 'Tell the friend immediately. Loyalty demands total honesty, no matter how much the truth might hurt.',
        scores: { Gryffon: 2, Unycorn: 1 },
        electives: ['LEG-110', 'LEG-110'],
      },
      {
        text: "Cross-reference the raven's claim. Birds are notorious liars, and you need empirical proof before acting.",
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-120', 'SPH-120'],
      },
      {
        text: 'Keep the secret, but observe the friend closely to silently understand the root pain that caused their actions.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['DIV-101', 'DIV-101'],
      },
      {
        text: 'Teach the raven a new, scandalous secret about yourself to make it an even trade, then swear it to secrecy.',
        scores: { Unycorn: 2, Spynx: 1 },
        electives: ['UNI-110', 'UNI-110'],
      },
    ],
  },
  {
    id: 4,
    title:
      'You wake up and realize you are trapped inside a painting. Which genre of art would you hope it is?',
    options: [
      {
        text: 'A grand historical mural depicting a glorious, hard-fought battle where the heroes stand victorious.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'A precise, geometric architectural blueprint or a detailed botanical study.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['HRT-101', 'HRT-101'],
      },
      {
        text: "A surreal, swirling dreamscape where gravity doesn't exist and colors bleed together.",
        scores: { Hydra: 2, Gryffon: 1 },
        electives: ['DIV-101'],
      },
      {
        text: 'A chaotic, vibrant pop-art collage or a lively caricature where everyone is having a party.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-101', 'HRT-101'],
      },
    ],
  },
  {
    id: 5,
    title:
      "You are asked to write a 10-page essay on the concept of 'Time'. How do you approach the assignment?",
    options: [
      {
        text: 'Write exactly ten pages detailing how time is a tactical resource that must not be wasted, heavily citing historical military schedules.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Submit a complex mathematical proof detailing the theory of relativity and the decay of atomic isotopes.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'Write a meditative poem on how time is a cyclical illusion, and how the past and future exist simultaneously in the mind.',
        scores: { Hydra: 2, Unycorn: 1 },
        electives: ['HYD-101'],
      },
      {
        text: "Submit a single, blank piece of paper with the word 'LATER' written on it in glitter pen.",
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-110'],
      },
    ],
  },
  {
    id: 6,
    title:
      'When facing an opponent in a duel who possesses greater raw power than you, what is your strategy?',
    options: [
      {
        text: 'Maintain strict guard forms and footwork, enduring their assault until their stamina falters, then execute a decisive counter-strike.',
        scores: { Gryffon: 2, Hydra: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Observe their cadence to identify a mechanical or positioning blind spot, calculating the exact moment to exploit their technical flaw.',
        scores: { Spynx: 2, Gryffon: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'Maintain absolute mental composure, refusing to let fear cloud your focus, and force them into making a reckless error out of frustration.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'Change the pace of combat with theatrical flair, misdirection, and unpredictable maneuvers to throw off their balance and win with style.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-101', 'UNI-110'],
      },
    ],
  },
  {
    id: 7,
    title: 'What style of specialized tool or equipment feels most natural in your hands?',
    options: [
      {
        text: 'Well-balanced martial gear, heavy shields, or tactical armaments that require physical conditioning and footwork to master.',
        scores: { Gryffon: 2, Unycorn: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Crystal-charged apparatuses, intricate toolkits, or Vertazyum micro-gear devices requiring technical understanding to operate.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'Resonant spellcasting foci, attunement catalysts, or mental meditation techniques that channel power directly through intent.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101', 'DIV-101'],
      },
      {
        text: 'Customized musical instruments, lightweight blades, or versatile disguise kits that allow for quick adaptability and flair.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-101', 'UNI-110'],
      },
    ],
  },
  {
    id: 8,
    title:
      'All K.A.M.P. students contribute to estate operations. Which daily campus duty appeals to you most?',
    options: [
      {
        text: 'Joining perimeter security patrols, guarding estate borders, and hunting/foraging in the forest for the dining hall.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101', 'SPH-120'],
      },
      {
        text: 'Assisting as a laboratory technician in potion labs or cataloging rare texts in the Great Tower Library.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'Tending to rare magical flora in the greenhouses and foraging volatile botanical reagents for campus wards.',
        scores: { Hydra: 2, Gryffon: 1 },
        electives: ['SPH-120', 'HRT-101'],
      },
      {
        text: 'Managing campus event staging, decorating estate quarters, and organizing student social gatherings.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-101', 'LEG-110'],
      },
    ],
  },
  {
    id: 9,
    title: 'Which extracurricular student organization or campus club catches your eye for off-hours?',
    options: [
      {
        text: 'Mastering military theory, conflict analysis, and war game scenarios with the Tactical Gaming & Strategy Club.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Researching rare reagents, potion brewing, and soil chemistry with the Botanical Alchemy & Gardening Club.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-120', 'HRT-101'],
      },
      {
        text: 'Engaging in policy debates, philosophy, and spiritual governance with the Student Government & Chance Society.',
        scores: { Hydra: 2, Unycorn: 1 },
        electives: ['LEG-110', 'DIV-101'],
      },
      {
        text: 'Practicing high-speed arena sports, performance pageantry, and crowd engagement with the Zyng Athletic League.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-101'],
      },
    ],
  },
  {
    id: 10,
    title:
      'Looking ahead toward your senior terms, what advanced mastery capstone path inspires you most?',
    options: [
      {
        text: 'Leading large-scale squad tactics, dynamic arena manipulation, and varsity sports command.',
        scores: { Gryffon: 2, Unycorn: 1 },
        electives: [],
      },
      {
        text: 'Studying multi-realm portals, astrophysics, Kraykatzyte alloys, and planar physical science.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: [],
      },
      {
        text: 'Shaping metal without fire through pure mental force, psionics, and resonant crystal arrays.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: [],
      },
      {
        text: 'Orchestrating grand spectacles, running campus intelligence networks, or earning the title of Primadonna.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: [],
      },
    ],
  },
  {
    id: 11,
    title:
      'While conducting field research in the wilderness, your group encounters an aggressive wild beast. How do you respond?',
    options: [
      {
        text: 'Step forward to draw its attention, establishing a firm defensive stance to keep allies protected while directing squad positioning.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Identify its species and behavioral traits instantly, using specific scent counters or environmental factors to neutralize its threat.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-120'],
      },
      {
        text: 'Extend a calming aura or mental impulse toward the creature, soothing its aggressive instincts through focused willpower.',
        scores: { Hydra: 2, Gryffon: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'Use vocal mimicry, sudden sensory flashes, or food lures to trick the beast into retreating while entertaining your allies.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-110', 'UNI-101'],
      },
    ],
  },
  {
    id: 12,
    title:
      'You need to uncover restricted information buried in ancient records. What is your research method?',
    options: [
      {
        text: 'Cross-reference historical war campaigns, regional border maps, and military battle logs for tactical clues.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Use Googgles and optical scrying arrays to analyze and cross-reference multiple library texts simultaneously.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'Examine ancient glyphs, analyze planar signatures, and scry residual energy directly from local artifacts.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'Gather local rumors, cultivate social contacts, and use clever charm to sneak into private archives.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-110'],
      },
    ],
  },
  {
    id: 13,
    title:
      'When the floating city of The Masquerade stops at K.A.M.P., how do you plan to showcase your skills during Open Auditions?',
    options: [
      {
        text: 'Lead K.A.M.P. to victory in the Great Colosseum combat games or the Zyng league finals.',
        scores: { Gryffon: 2, Unycorn: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Unveil a groundbreaking magitech invention, alchemical formulation, or scientific theoretical paper.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110', 'SPH-120'],
      },
      {
        text: 'Demonstrate an extraordinary display of high-tier magic, psionic discipline, or divine spellcraft before the judges.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101', 'DIV-101'],
      },
      {
        text: 'Take center stage as Primadonna, mesmerizing the grand audience with artistic beauty, music, and theatrical splendor.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-101'],
      },
    ],
  },
  {
    id: 14,
    title:
      'How do you handle a scenario where your squad must operate quietly in high-risk hostile territory?',
    options: [
      {
        text: 'Maintain strict point-guard formations, checking rear sightlines and keeping squad movement disciplined and silent.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Use environmental detection gear to track guard movements and calculate guard patrol timing patterns.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110', 'UNI-110'],
      },
      {
        text: 'Weave a silent mental link between party members while scanning the area for hidden magical alarm wards.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'Move along rooftops or shadows using stealth and agility, ready to create a flamboyant distraction if discovered.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-110'],
      },
    ],
  },
  {
    id: 15,
    title:
      'Your squad is tasked with aiding a struggling settlement near campus. What form of assistance do you offer?',
    options: [
      {
        text: 'Organize settlement defense patrols, repair physical fortifications, and train local guards in basic defensive drills.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101', 'LEG-110'],
      },
      {
        text: 'Repair local magitech infrastructure, test water filtration systems, and optimize agricultural yields using scientific data.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110', 'HRT-101'],
      },
      {
        text: 'Provide divine counseling, resolve internal disputes through ethical mediation, and set up protective ward sanctuaries.',
        scores: { Hydra: 2, Unycorn: 1 },
        electives: ['DIV-101', 'LEG-110'],
      },
      {
        text: 'Organize public events, community fundraisers, and artistic festivals to raise morale and economic support.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-101', 'LEG-110'],
      },
    ],
  },
  {
    id: 16,
    title: 'During a field mission, a companion suffers a severe physical injury. How do you assist?',
    options: [
      {
        text: 'Apply rapid physical triage—securing splints, binding wounds under pressure, and carrying them to a secure position.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'Synthesize precise herbal coagulants and alchemical restorative salves from your field kit to treat the injury.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-120', 'HRT-101'],
      },
      {
        text: 'Channel steady restorative energy or divine magic to soothe their vital system and keep their mind calm.',
        scores: { Hydra: 2, Gryffon: 1 },
        electives: ['DIV-101', 'HYD-101'],
      },
      {
        text: 'Use calming vocal cadence and music to relieve trauma and shock, keeping their spirits high while aiding their recovery.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-101'],
      },
    ],
  },
  {
    id: 17,
    title:
      'Your squad is planning a covert operation to retrieve an item. What role do you prefer to play?',
    options: [
      {
        text: 'The Enforcer / Overwatch: Standing guard at entry points, securing the escape route, and handling opposition if spotted.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'The Mastermind: Mapping out security mechanisms, bypass routes, and internal systems ahead of time.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110', 'UNI-110'],
      },
      {
        text: 'The Anchor: Maintaining silent telepathic contact across the squad while monitoring unseen spell wards.',
        scores: { Hydra: 2, Unycorn: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'The Distraction / Face: Walking right up to the front gate in a grand costume to draw every eye in the room to buy time.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: ['UNI-110', 'UNI-101'],
      },
    ],
  },
  {
    id: 18,
    title: 'You recover an ancient, unidentified magical relic from a dungeon ruin. How do you analyze it?',
    options: [
      {
        text: 'Place it in a secure containment case, escorting it safely under guard to campus facilities for evaluation.',
        scores: { Gryffon: 2, Spynx: 1 },
        electives: ['GRY-101', 'LEG-110'],
      },
      {
        text: 'Measure its magnetic pull, analyze its metallic composition, and record its physical properties in your Kodex.',
        scores: { Spynx: 2, Hydra: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'Attune your senses to its planar energy signature, identifying ancient glyphs and inspecting for curses.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101', 'DIV-101'],
      },
      {
        text: 'Inspect its artistic craftsmanship, estimate its historical value, and ponder the story behind its creator.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['LEG-110', 'UNI-101'],
      },
    ],
  },
  {
    id: 19,
    title:
      'What core value keeps your character pushing forward when physically and mentally exhausted?',
    options: [
      {
        text: 'Unyielding duty to your squadmates and a refusal to fail those who rely on your physical strength.',
        scores: { Gryffon: 2, Hydra: 1 },
        electives: [],
      },
      {
        text: 'An insatiable curiosity to solve the next complex mystery and understand how the world works.',
        scores: { Spynx: 2, Gryffon: 1 },
        electives: [],
      },
      {
        text: 'The drive for complete self-mastery, knowing that true power comes from overcoming internal limits.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: [],
      },
      {
        text: 'The passion to live a life worth telling stories about and inspiring others through bold, creative deeds.',
        scores: { Unycorn: 2, Gryffon: 1 },
        electives: [],
      },
    ],
  },
  {
    id: 20,
    title:
      'In a formal duel with an arrogant rival, they grant you the choice of terms. What do you select?',
    options: [
      {
        text: 'A straightforward martial contest using standard weapons, defined boundaries, and victory by yield or knockout.',
        scores: { Gryffon: 2, Unycorn: 1 },
        electives: ['GRY-101'],
      },
      {
        text: 'A competitive tactical trial, such as a timed obstacle course, technical riddle, or strategic game of skill.',
        scores: { Spynx: 2, Gryffon: 1 },
        electives: ['SPH-110'],
      },
      {
        text: 'A test of endurance and mental focus where raw impulse and emotional anger result in immediate disqualification.',
        scores: { Hydra: 2, Spynx: 1 },
        electives: ['HYD-101'],
      },
      {
        text: 'A spectacle! A duel fought on an elevated stage where creative flourishes, crowd favor, and flair influence scoring.',
        scores: { Unycorn: 2, Hydra: 1 },
        electives: ['UNI-101'],
      },
    ],
  },
];

interface KAMPSortingQuizProps {
  onClose?: () => void;
  onCompleteAndOpenKodex?: () => void;
  isEmbedded?: boolean;
}

export const KAMPSortingQuiz: React.FC<KAMPSortingQuizProps> = ({
  onClose,
  onCompleteAndOpenKodex,
  isEmbedded = false,
}) => {
  const { account, activeCharacter, updateKAMPAcademics, updateCharacter } = useCharacter();

  const [step, setStep] = useState<'intro' | 'quiz' | 'tiebreaker' | 'result'>('intro');
  const [playerName, setPlayerName] = useState(
    account.discordUsername || account.displayName || ''
  );
  const [studentName, setStudentName] = useState(activeCharacter?.name || '');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<KAMPQuizOption[]>([]);
  const [tiedPaths, setTiedPaths] = useState<KAMPCoreHouse[]>([]);
  const [tieWinnerOverride, setTieWinnerOverride] = useState<KAMPCoreHouse | null>(null);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);

  // Calculate house & elective scores
  const computedResult = useMemo(() => {
    const pathScores: Record<KAMPCoreHouse, number> = {
      Gryffon: 0,
      Spynx: 0,
      Hydra: 0,
      Unycorn: 0,
    };
    const electiveScores: Record<string, number> = {
      'GRY-101': 0,
      'SPH-110': 0,
      'SPH-120': 0,
      'HYD-101': 0,
      'UNI-101': 0,
      'UNI-110': 0,
      'DIV-101': 0,
      'LEG-110': 0,
      'HRT-101': 0,
    };

    answers.forEach((ans) => {
      if (!ans) return;
      (Object.entries(ans.scores) as Array<[KAMPCoreHouse, number]>).forEach(([house, pts]) => {
        pathScores[house] = (pathScores[house] || 0) + (pts || 0);
      });
      ans.electives.forEach((code) => {
        if (electiveScores[code] !== undefined) {
          electiveScores[code] += 1;
        }
      });
    });

    if (tieWinnerOverride) {
      pathScores[tieWinnerOverride] += 1;
    }

    const sortedPaths = (Object.entries(pathScores) as Array<[KAMPCoreHouse, number]>).sort(
      (a, b) => b[1] - a[1]
    );
    const primaryPath: KAMPCoreHouse = sortedPaths[0]?.[0] || 'Gryffon';
    const secondaryPath: KAMPCoreHouse = sortedPaths[1]?.[0] || 'Spynx';

    const sortedElectives = Object.entries(electiveScores).sort((a, b) => b[1] - a[1]);
    const pElecCode = sortedElectives[0]?.[0] || 'HYD-101';
    const sElecCode = sortedElectives[1]?.[0] || 'SPH-110';

    return {
      pathScores,
      primaryPath,
      secondaryPath,
      pElecCode,
      sElecCode,
      pElec: KAMP_COURSE_DETAILS[pElecCode],
      sElec: KAMP_COURSE_DETAILS[sElecCode],
      pathData: KAMP_PATH_DATA[primaryPath],
      advisors: KAMP_ADVISORS[primaryPath],
    };
  }, [answers, tieWinnerOverride]);

  const handleStartQuiz = () => {
    if (!playerName.trim() || !studentName.trim()) return;
    playKeyClick();
    setCurrentQ(0);
    setAnswers([]);
    setTieWinnerOverride(null);
    setEnrolledSuccess(false);
    setStep('quiz');
  };

  const handleSelectOption = (opt: KAMPQuizOption) => {
    playOptionSelect();
    const nextAnswers = [...answers];
    nextAnswers[currentQ] = opt;
    setAnswers(nextAnswers);

    if (currentQ < KAMP_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Evaluate tie
      const tempScores: Record<KAMPCoreHouse, number> = {
        Gryffon: 0,
        Spynx: 0,
        Hydra: 0,
        Unycorn: 0,
      };
      nextAnswers.forEach((a) => {
        (Object.entries(a.scores) as Array<[KAMPCoreHouse, number]>).forEach(([h, p]) => {
          tempScores[h] += p || 0;
        });
      });
      const maxPts = Math.max(...Object.values(tempScores));
      const tied = (Object.keys(tempScores) as KAMPCoreHouse[]).filter(
        (h) => tempScores[h] === maxPts
      );
      if (tied.length > 1) {
        setTiedPaths(tied);
        setStep('tiebreaker');
      } else {
        playDivineReveal();
        setStep('result');
      }
    }
  };

  const handleBindToKodex = () => {
    if (!activeCharacter) return;
    playDivineReveal();

    const { primaryPath, secondaryPath, pElecCode, sElecCode, pathData, advisors } = computedResult;

    updateKAMPAcademics(activeCharacter.id, {
      attended: true,
      houseId: primaryPath as KAMPHouseId,
      houseName: `House ${primaryPath}`,
      secondaryPath: secondaryPath as KAMPHouseId,
      houseAdvisor: advisors.house,
      facultyAdvisor: advisors.faculty,
      primaryElective: pElecCode,
      secondaryElective: sElecCode,
      continuationCourse: pathData.continuation,
      capstoneCourse: pathData.capstone,
      yearOfStudy: 'First-Year',
      majorDiscipline: pathData.majorDiscipline,
      academicStanding: 'Good Standing',
      dormitory: pathData.dormitory,
      houseBoon: pathData.boon,
    });

    updateCharacter(activeCharacter.id, {
      name: studentName.trim() || activeCharacter.name,
      hasCompletedKAMPTrial: true,
    });

    setEnrolledSuccess(true);
    if (onCompleteAndOpenKodex) {
      setTimeout(() => onCompleteAndOpenKodex(), 900);
    }
  };

  const question = KAMP_QUESTIONS[currentQ];
  const progressPct = Math.round((currentQ / KAMP_QUESTIONS.length) * 100);

  return (
    <div
      className={`w-full ${
        isEmbedded ? 'h-full overflow-y-auto' : 'max-w-5xl mx-auto my-4'
      } slate-masonry rounded-2xl p-4 sm:p-7 text-[#111111] select-none`}
    >
      <div className="marble-slab rounded-xl p-4 sm:p-7 border-2 border-[#1c1d1e] shadow-inner relative">
        {/* Top Close / Header Strip */}
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#8b1e1e]" />
            <span className="kodex-font-cinzel text-xs sm:text-sm font-bold tracking-wider uppercase text-[#7f1d1d]">
              K.A.M.P. First-Year Intake &amp; House Sorting Evaluation
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 eink-btn kodex-font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          )}
        </div>

        {/* STEP 1: ACCEPTANCE LETTER INTRO */}
        {step === 'intro' && (
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="text-center space-y-1">
              <div className="kodex-font-mono text-xs uppercase tracking-[0.25em] text-[#8b1e1e] font-bold">
                Konran Academy of Might &amp; Proficiency
              </div>
              <h1 className="kodex-font-title text-2xl sm:text-4xl font-bold text-[#450a0a]">
                Official Letter of Acceptance
              </h1>
              <p className="kodex-font-fell italic text-xs sm:text-sm text-[#7f1d1d]">
                Term Commences on Solisvara 19 • Main Campus, Thyrst River Basin
              </p>
            </div>

            <div className="bg-[#fafaf7] border-2 border-[#111111] rounded-lg p-5 space-y-4 kodex-font-fell text-sm leading-relaxed text-[#111111]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-stone-300">
                <div>
                  <label className="block kodex-font-mono text-[11px] uppercase font-bold text-[#7f1d1d] mb-1">
                    Guardian / Player Name *
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Player Name..."
                    className="w-full px-3 py-2 bg-white border-2 border-[#111111] kodex-font-mono text-sm text-[#111111] focus:border-[#8b1e1e] outline-none"
                  />
                </div>
                <div>
                  <label className="block kodex-font-mono text-[11px] uppercase font-bold text-[#7f1d1d] mb-1">
                    Incoming Cadet / Student Name *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Cadet Name..."
                    className="w-full px-3 py-2 bg-white border-2 border-[#111111] kodex-font-mono text-sm text-[#111111] focus:border-[#8b1e1e] outline-none"
                  />
                </div>
              </div>

              <p>
                Dear <strong>{playerName || 'Guardian'}</strong>, we are pleased to inform you that your ward,{' '}
                <strong className="text-[#8b1e1e]">{studentName || 'Cadet'}</strong>, has been accepted at the{' '}
                <strong>Konran Academy of Might &amp; Proficiency (K.A.M.P.)</strong> as a First-Year Student!
              </p>
              <p>
                Before arriving on campus, all incoming students must complete this 20-question{' '}
                <strong>Student Intake &amp; Aspirations Questionnaire</strong>. This evaluation determines their{' '}
                <strong>Primary House Path</strong>, assigns their esteemed Faculty Advisors, and prescribes their{' '}
                <strong>9-Day / 36-Hour Ovester Course Matrix</strong>.
              </p>

              <div className="p-3.5 bg-[#fcf0f0] border-l-4 border-[#8b1e1e] space-y-1.5 text-xs kodex-font-cinzel">
                <div className="font-bold text-[#7f1d1d] uppercase tracking-wider">
                  The Four Paths of K.A.M.P.:
                </div>
                <div>
                  • <strong>House Gryffon:</strong> Martial prowess, tactical combat, physical conditioning, and unwavering duty.
                </div>
                <div>
                  • <strong>House Spynx:</strong> Alchemy, CrystalPunk magitech, research, logic, and profound technical understanding.
                </div>
                <div>
                  • <strong>House Hydra:</strong> Arcane arts, life science, mental discipline, psionics, and planar magic.
                </div>
                <div>
                  • <strong>House Unycorn:</strong> Performance, acoustic composition, roguish arts, chance, and magnificent unpredictability.
                </div>
              </div>

              <div className="text-right pt-2 kodex-font-cinzel text-xs text-[#450a0a] space-y-0.5">
                <div className="font-bold">— Headmistress Kanyssa Applebaum</div>
                <div className="font-bold">— Headmistrex Syster Satisfaction</div>
              </div>
            </div>

            <button
              disabled={!playerName.trim() || !studentName.trim()}
              onClick={handleStartQuiz}
              className="w-full py-3.5 eink-btn-solid kodex-font-cinzel text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <span>Commence 20-Question Sorting Evaluation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: 20-QUESTION EVALUATION */}
        {step === 'quiz' && question && (
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="flex items-center justify-between kodex-font-mono text-xs font-bold text-[#7f1d1d]">
              <span>
                QUESTION {currentQ + 1} OF {KAMP_QUESTIONS.length}
              </span>
              <span>CADET: {studentName.toUpperCase()}</span>
            </div>

            <div className="h-3.5 bg-[#f8efef] border-2 border-[#8b1e1e] p-0.5">
              <div
                className="h-full bg-[#8b1e1e] transition-all duration-300 relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute inset-0 eink-dither opacity-80" />
              </div>
            </div>

            <div className="bg-[#fafaf7] border-2 border-[#111111] rounded-lg p-5">
              <h2 className="kodex-font-title text-base sm:text-lg font-bold text-[#450a0a] leading-snug mb-4">
                {question.id}. {question.title}
              </h2>

              <div className="space-y-2.5">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left p-3.5 course-card rounded-lg kodex-font-fell text-xs sm:text-sm text-[#111111] hover:bg-[#fcf0f0] transition-all cursor-pointer flex items-start gap-3"
                  >
                    <span className="w-6 h-6 shrink-0 bg-[#7f1d1d] text-[#fef2f2] kodex-font-mono text-xs font-bold flex items-center justify-center mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {currentQ > 0 ? (
                <button
                  onClick={() => {
                    playKeyClick();
                    setCurrentQ(currentQ - 1);
                  }}
                  className="px-4 py-2 eink-btn kodex-font-cinzel text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Question</span>
                </button>
              ) : (
                <div />
              )}
              <span className="kodex-font-mono text-[11px] text-[#4a4a4a]">
                Evaluation Progress: {progressPct}%
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: TIEBREAKER */}
        {step === 'tiebreaker' && (
          <div className="space-y-5 max-w-2xl mx-auto text-center py-6">
            <h2 className="kodex-font-title text-2xl font-bold text-[#7f1d1d]">
              A Crossroads of Potential
            </h2>
            <p className="kodex-font-fell text-sm text-[#4a4a4a]">
              Your aptitude is evenly split across multiple Houses. Choose the path that calls to you most:
            </p>
            <div className="space-y-3">
              {tiedPaths.map((path) => (
                <button
                  key={path}
                  onClick={() => {
                    playDivineReveal();
                    setTieWinnerOverride(path);
                    setStep('result');
                  }}
                  className="w-full p-4 course-card rounded-lg kodex-font-cinzel text-sm font-bold text-[#450a0a] hover:bg-[#fcf0f0] cursor-pointer"
                >
                  I pledge myself to the path of House {path}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: OFFICIAL STUDENT ID + 9-DAY / 36-HOUR DOSSIER */}
        {step === 'result' && (
          <div className="space-y-6">
            {enrolledSuccess && (
              <div className="p-3 bg-[#fcf0f0] border-2 border-[#8b1e1e] text-[#7f1d1d] kodex-font-mono text-xs font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  MATRICULATION COMPLETE // HOUSE {computedResult.primaryPath.toUpperCase()} &amp; ELECTIVES BOUND TO KODEX
                </span>
              </div>
            )}

            {/* Student ID Card & House Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-5 text-center space-y-3 shadow-sm">
                <div className="kodex-font-mono text-[10px] uppercase tracking-widest text-[#8b1e1e] font-bold">
                  KONRAN ACADEMY OF MIGHT &amp; PROFICIENCY
                </div>
                <h3 className="kodex-font-title text-xl font-bold text-[#450a0a] border-b border-stone-300 pb-2">
                  OFFICIAL STUDENT I.D. // TERM 1
                </h3>

                <div className="space-y-2 text-left kodex-font-cinzel text-xs pt-1">
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span className="text-[#4a4a4a]">Cadet Name:</span>
                    <span className="font-bold text-[#111111]">{studentName.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span className="text-[#4a4a4a]">Primary Path (House):</span>
                    <span className="font-bold text-[#8b1e1e] uppercase">
                      HOUSE {computedResult.primaryPath}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span className="text-[#4a4a4a]">Secondary Aptitude:</span>
                    <span className="font-bold text-[#111111]">
                      House {computedResult.secondaryPath}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span className="text-[#4a4a4a]">House Advisor:</span>
                    <span className="font-bold text-[#111111]">
                      {computedResult.advisors.house}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span className="text-[#4a4a4a]">Faculty Advisor:</span>
                    <span className="font-bold text-[#111111]">
                      {computedResult.advisors.faculty}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-[#4a4a4a]">Assigned Dormitory:</span>
                    <span className="font-bold text-[#111111]">
                      {computedResult.pathData.dormitory}
                    </span>
                  </div>
                </div>

                {/* House Scores Breakdown */}
                <div className="pt-2 border-t border-stone-300 grid grid-cols-4 gap-1.5 text-center kodex-font-mono text-[10px]">
                  {(['Gryffon', 'Spynx', 'Hydra', 'Unycorn'] as KAMPCoreHouse[]).map((h) => (
                    <div
                      key={h}
                      className={`p-1.5 border ${
                        computedResult.primaryPath === h
                          ? 'bg-[#7f1d1d] text-white border-[#450a0a] font-bold'
                          : 'bg-[#f5f5f0] text-[#111111] border-stone-300'
                      }`}
                    >
                      <div>{h.substring(0, 3).toUpperCase()}</div>
                      <div className="text-xs">{computedResult.pathScores[h]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescribed Electives & Capstone Track */}
              <div className="lg:col-span-7 bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-5 space-y-3">
                <h3 className="kodex-font-title text-lg font-bold text-[#7f1d1d] border-b border-stone-300 pb-2">
                  Prescribed Academic Track &amp; 5.5e House Boon
                </h3>

                <div className="space-y-2 text-xs kodex-font-cinzel">
                  <div className="p-2.5 bg-[#fcf0f0] border-l-4 border-[#8b1e1e]">
                    <div className="font-bold text-[#450a0a]">
                      Primary Major Elective: {computedResult.pElec?.code} — {computedResult.pElec?.title}
                    </div>
                    <div className="text-[#4a4a4a] kodex-font-fell italic">
                      Instructor: {computedResult.pElec?.instructor} ({computedResult.pElec?.place}) — {computedResult.pElec?.desc}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#f5f5f0] border-l-4 border-[#111111]">
                    <div className="font-bold text-[#111111]">
                      Secondary Cross-Elective: {computedResult.sElec?.code} — {computedResult.sElec?.title}
                    </div>
                    <div className="text-[#4a4a4a] kodex-font-fell italic">
                      Instructor: {computedResult.sElec?.instructor} ({computedResult.sElec?.place}) — {computedResult.sElec?.desc}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2 bg-white border border-stone-300">
                      <span className="kodex-font-mono text-[10px] uppercase text-[#7f1d1d] font-bold block">
                        Continuation Track (Term 2):
                      </span>
                      <span className="font-semibold text-[#111111]">
                        {computedResult.pathData.continuation}
                      </span>
                    </div>
                    <div className="p-2 bg-white border border-stone-300">
                      <span className="kodex-font-mono text-[10px] uppercase text-[#7f1d1d] font-bold block">
                        Senior Mastery Capstone:
                      </span>
                      <span className="font-semibold text-[#111111]">
                        {computedResult.pathData.capstone}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fcf0f0] border border-[#8b1e1e] kodex-font-mono text-xs">
                    <div className="font-bold text-[#7f1d1d] uppercase">
                      5.5e House Boon: {computedResult.pathData.boon.name}
                    </div>
                    <div className="text-[#111111] mt-0.5">
                      {computedResult.pathData.boon.dndMechanic}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official 9-Day Konran Matrix Schedule of Classes */}
            <div className="bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-4 overflow-x-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b-2 border-[#111111]">
                <div>
                  <h4 className="kodex-font-title text-sm sm:text-base font-bold text-[#450a0a] uppercase">
                    Official Schedule of Classes // Term 1 (Ovesters 1 &amp; 2)
                  </h4>
                  <p className="kodex-font-mono text-[10px] text-[#7f1d1d]">
                    9-Day Konran Matrix: P=Pacem, F=Fortudo, S=Sutya, V=Vetyta, J=Juvaus, A=Amzytia, D=Dysci, L=Ludus, G=Grattudo
                  </p>
                </div>
                <span className="kodex-font-mono text-xs font-bold bg-[#7f1d1d] text-white px-2.5 py-1">
                  30 CREDITS PRESCRIBED
                </span>
              </div>

              <table className="w-full border-collapse text-xs kodex-font-mono">
                <thead>
                  <tr className="bg-[#111111] text-[#f5f5f0] text-left">
                    <th className="p-2 border border-stone-400">Course #</th>
                    <th className="p-2 border border-stone-400">Name of Course</th>
                    <th className="p-2 border border-stone-400">Days</th>
                    <th className="p-2 border border-stone-400">Time (36h)</th>
                    <th className="p-2 border border-stone-400">Instructor</th>
                    <th className="p-2 border border-stone-400">Place</th>
                    <th className="p-2 border border-stone-400">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#f5f5f0]">
                    <td className="p-2 border border-stone-300 font-bold">CORE105</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE105.title}</td>
                    <td className="p-2 border border-stone-300">P S A L</td>
                    <td className="p-2 border border-stone-300">08:00 - 09:50</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE105.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{KAMP_COURSE_DETAILS.CORE105.place}</td>
                    <td className="p-2 border border-stone-300">Core</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border border-stone-300 font-bold">CORE104</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE104.title}</td>
                    <td className="p-2 border border-stone-300">P S A L</td>
                    <td className="p-2 border border-stone-300">10:00 - 11:50</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE104.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{KAMP_COURSE_DETAILS.CORE104.place}</td>
                    <td className="p-2 border border-stone-300">Core</td>
                  </tr>
                  <tr className="bg-[#fcf0f0] font-semibold">
                    <td className="p-2 border border-stone-300 font-bold text-[#8b1e1e]">{computedResult.pElecCode}</td>
                    <td className="p-2 border border-stone-300 text-[#450a0a]">{computedResult.pElec?.title}</td>
                    <td className="p-2 border border-stone-300">P S A L</td>
                    <td className="p-2 border border-stone-300">13:00 - 14:50</td>
                    <td className="p-2 border border-stone-300">{computedResult.pElec?.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{computedResult.pElec?.place}</td>
                    <td className="p-2 border border-stone-300 text-[#8b1e1e]">Primary Major</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border border-stone-300 font-bold">CORE103</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE103.title}</td>
                    <td className="p-2 border border-stone-300">P F S V A D L</td>
                    <td className="p-2 border border-stone-300">15:00 - 16:20</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE103.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{KAMP_COURSE_DETAILS.CORE103.place}</td>
                    <td className="p-2 border border-stone-300">Core</td>
                  </tr>
                  <tr className="bg-[#f5f5f0]">
                    <td className="p-2 border border-stone-300 font-bold">CORE101</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE101.title}</td>
                    <td className="p-2 border border-stone-300">F V D G</td>
                    <td className="p-2 border border-stone-300">08:00 - 11:50</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE101.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{KAMP_COURSE_DETAILS.CORE101.place}</td>
                    <td className="p-2 border border-stone-300">Core Field Lab</td>
                  </tr>
                  <tr className="bg-[#fcf0f0] font-semibold">
                    <td className="p-2 border border-stone-300 font-bold text-[#8b1e1e]">{computedResult.sElecCode}</td>
                    <td className="p-2 border border-stone-300 text-[#450a0a]">{computedResult.sElec?.title}</td>
                    <td className="p-2 border border-stone-300">F V D G</td>
                    <td className="p-2 border border-stone-300">13:00 - 14:50</td>
                    <td className="p-2 border border-stone-300">{computedResult.sElec?.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{computedResult.sElec?.place}</td>
                    <td className="p-2 border border-stone-300 text-[#8b1e1e]">Secondary</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border border-stone-300 font-bold">CORE106</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE106.title}</td>
                    <td className="p-2 border border-stone-300">P F S V A D L</td>
                    <td className="p-2 border border-stone-300">23:30 - 25:30</td>
                    <td className="p-2 border border-stone-300">{KAMP_COURSE_DETAILS.CORE106.instructor}</td>
                    <td className="p-2 border border-stone-300 font-bold">{KAMP_COURSE_DETAILS.CORE106.place}</td>
                    <td className="p-2 border border-stone-300">Night Watch</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    playKeyClick();
                    setStep('intro');
                    setCurrentQ(0);
                    setAnswers([]);
                    setEnrolledSuccess(false);
                  }}
                  className="px-4 py-2.5 eink-btn kodex-font-cinzel text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Evaluation</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 eink-btn kodex-font-cinzel text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
              </div>

              {activeCharacter && (
                <button
                  onClick={handleBindToKodex}
                  className="px-6 py-3 eink-btn-solid kodex-font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    Bind House {computedResult.primaryPath} &amp; Schedule to {activeCharacter.name}&apos;s Kodex
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KAMPSortingQuiz;
