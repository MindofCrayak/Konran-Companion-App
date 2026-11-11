import React, { useState, useEffect, useMemo } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';
import { KAMPSortingQuiz, KAMP_COURSE_DETAILS } from './KAMPSortingQuiz';
import {
  KAMP_COLLEGES,
  KAMP_COURSE_CATALOG,
  KAMP_FACULTY_ROSTER,
  KAMP_HOUSE_LORE,
  KAMP_MULTICLASS_PATHWAYS,
  KAMPCourseCatalogEntry,
  KAMPFacultyMember,
} from '../data/kampCatalog';

interface CourseItem {
  id: string;
  dept: 'CORE' | 'GRY' | 'SPH' | 'HYD' | 'UNI' | 'LEG' | 'DIV' | 'HRT' | 'EXT';
  code: string;
  title: string;
  tier: string;
  credits: number;
  instructor: string;
  statusText: string;
  bonusText: string;
  enrolled: boolean;
}

const DEFAULT_COURSES: CourseItem[] = [
  // 12 Mandatory Core Credits across Terms 1 & 2
  {
    id: 'core-101',
    dept: 'CORE',
    code: 'CORE-101',
    tier: 'Mandatory Core',
    title: 'CORE-101: Survivalism 101',
    credits: 2,
    instructor: 'Mother Aukymba & Rothar Earthshaper',
    statusText: 'ENROLLED // MANDATORY CORE',
    bonusText: 'Proficiency in Survival or Nature; advantage on foraging in non-native biomes.',
    enrolled: true,
  },
  {
    id: 'core-102',
    dept: 'CORE',
    code: 'CORE-102',
    tier: 'Mandatory Core',
    title: 'CORE-102: Hearth & Field Triage',
    credits: 2,
    instructor: 'Chef Ignatius Flamestove & Nuria Althea',
    statusText: 'ENROLLED // MANDATORY CORE',
    bonusText: "Proficiency with Herbalism Kit or Cook's Utensils; field salves stabilize dying allies with 1 temp HP.",
    enrolled: true,
  },
  {
    id: 'core-103',
    dept: 'CORE',
    code: 'CORE-103',
    tier: 'Mandatory Core',
    title: 'CORE-103: Life, Cultures & Public Ethics',
    credits: 2,
    instructor: 'Ambassador Starflower & Counselor Gloomshroud',
    statusText: 'ENROLLED // MANDATORY CORE',
    bonusText: '+1 to Insight and Religion; once per Long Rest reroll saving throw against Charmed or Frightened.',
    enrolled: true,
  },
  {
    id: 'core-104',
    dept: 'CORE',
    code: 'CORE-104',
    tier: 'Mandatory Core',
    title: 'CORE-104: History & Applied Tactics',
    credits: 2,
    instructor: 'Professor Yvctus (Tactician Master)',
    statusText: 'ENROLLED // MANDATORY CORE',
    bonusText: '+1 to History and Investigation on ruins/tactics; +1 to Initiative rolls.',
    enrolled: true,
  },
  {
    id: 'core-105',
    dept: 'CORE',
    code: 'CORE-105',
    tier: 'Mandatory Core',
    title: 'CORE-105: Martial Practice & Arena Athletics',
    credits: 2,
    instructor: 'Commander Lysander Lyteheart & Coach Thrain Ironarm',
    statusText: 'ENROLLED // MANDATORY CORE',
    bonusText: '+5 ft. Movement Speed in round 1; advantage on Athletics to shove, grapple, or break free.',
    enrolled: true,
  },
  {
    id: 'core-106',
    dept: 'CORE',
    code: 'CORE-106',
    tier: 'Mandatory Core',
    title: 'CORE-106: Celestial Navigation 101',
    credits: 2,
    instructor: 'Retcod Olloppa (Head of Space Science)',
    statusText: 'ENROLLED // MANDATORY CORE',
    bonusText: "Cannot become lost when stars/moons visible; proficiency with Navigator's Tools.",
    enrolled: true,
  },

  // Elective Specializations (Terms 3 & 4)
  {
    id: 'hyd-101',
    dept: 'HYD',
    code: 'HYD-101',
    tier: 'Tier B - Beginner',
    title: 'HYD-101: Magic Basics & Arcane Precision',
    credits: 2,
    instructor: 'Lady Byon (Head of Arcane Arts)',
    statusText: 'ENROLLED // ELECTIVE (B)',
    bonusText: 'Proficiency in Arcana; cantrips Prestidigitation and Mage Hand; +1 focus calibration.',
    enrolled: true,
  },
  {
    id: 'sph-110',
    dept: 'SPH',
    code: 'SPH-110',
    tier: 'Tier B - Beginner',
    title: 'SPH-110: Intro to Tinkering & Magitech Systems',
    credits: 2,
    instructor: 'Julius E. Brown (Master Librarian & Tinkerer)',
    statusText: 'ENROLLED // ELECTIVE (B)',
    bonusText: "Proficiency with Tinker's Tools; field-repair damaged gear and recharge mana cells on short rest.",
    enrolled: true,
  },
  {
    id: 'gry-220',
    dept: 'GRY',
    code: 'GRY-220',
    tier: 'Tier A - Advanced',
    title: 'GRY-220: Advanced Gym: Mounted Combat & Formations',
    credits: 3,
    instructor: 'Coach Thrain Ironarm',
    statusText: 'ENROLLED // ELECTIVE (A)',
    bonusText: 'Unlocks Mounted Combatant feat profile; Animal Handling; +1 AC to adjacent allies in shield-wall.',
    enrolled: true,
  },

  // Capstone Phase (Term 5 - Strict 1 Mastery Course Limit)
  {
    id: 'hyd-350',
    dept: 'HYD',
    code: 'HYD-350',
    tier: 'Tier M - Senior Mastery',
    title: 'HYD-350: Mind-Forging & Psionic Metallurgy',
    credits: 5,
    instructor: 'Forgemaster Goggers Smoothsmyth',
    statusText: 'ENROLLED // SENIOR MASTERY CAPSTONE',
    bonusText: 'Forge a signature +2 Psionic Weapon/Focus adding Force damage equal to INT or Psionic mod.',
    enrolled: true,
  },

  // Extracurricular Athletics (Grand Arena & Zyng!)
  {
    id: 'ext-101',
    dept: 'EXT',
    code: 'EXT-101',
    tier: 'Extracurricular (Zyng!)',
    title: 'EXT-101: Zyng 101: Applied Aerial Tactics',
    credits: 0,
    instructor: 'Professor Yvctus (Creator of Zyng!)',
    statusText: 'CERTIFIED PREREQUISITE',
    bonusText: 'Wingsuit Gliders, Magnetic Footwear; eliminates disadvantage on ranged attacks/spells while on rails.',
    enrolled: true,
  },
  {
    id: 'ext-210',
    dept: 'EXT',
    code: 'EXT-210',
    tier: 'Extracurricular (Zyng!)',
    title: 'EXT-210: Zyng! Varsity Practicum & Dungeon Navigation',
    credits: 1,
    instructor: 'Commander Lysander Lyteheart (Games Mistress)',
    statusText: 'ENROLLED // VARSITY ROSTER',
    bonusText: 'Reaction: When ally within 15 ft is attacked, grant +2 AC bonus or allow immediate 5 ft disengage.',
    enrolled: true,
  },
];

type KodexSubTab = 'dossier' | 'catalogue' | 'faculty' | 'campus' | 'pathways';

export const KAMPTerminalView: React.FC = () => {
  const { activeCharacter } = useCharacter();
  const [activeSubTab, setActiveSubTab] = useState<KodexSubTab>('dossier');
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [isCompactSlate, setIsCompactSlate] = useState(false);
  const [showLibraryNotice, setShowLibraryNotice] = useState(false);
  const [showSortingQuiz, setShowSortingQuiz] = useState(false);
  const [sanctifiedPulse, setSanctifiedPulse] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  // Filters for Course Catalogue & Faculty
  const [courseFilterDept, setCourseFilterDept] = useState<string>('ALL');
  const [courseFilterTier, setCourseFilterTier] = useState<string>('ALL');
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>('');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState<KAMPFacultyMember | null>(KAMP_FACULTY_ROSTER[0]);

  // Sync courses dynamically if the character has completed the K.A.M.P. Sorting Quiz
  useEffect(() => {
    const pElecCode = activeCharacter?.kampProfile?.primaryElective;
    const sElecCode = activeCharacter?.kampProfile?.secondaryElective;
    if (pElecCode && sElecCode) {
      const pMeta = KAMP_COURSE_DETAILS[pElecCode];
      const sMeta = KAMP_COURSE_DETAILS[sElecCode];
      const customCourses: CourseItem[] = [
        DEFAULT_COURSES[0],
        DEFAULT_COURSES[1],
        DEFAULT_COURSES[2],
        DEFAULT_COURSES[3],
        DEFAULT_COURSES[4],
        DEFAULT_COURSES[5],
      ];
      if (pMeta) {
        const catEntry = KAMP_COURSE_CATALOG.find((c) => c.code === pElecCode);
        customCourses.push({
          id: pElecCode.toLowerCase(),
          dept: (catEntry?.dept || 'HYD') as any,
          code: pElecCode,
          tier: catEntry?.tier || 'Tier A - Advanced',
          title: `${pElecCode}: ${pMeta.title}`,
          credits: catEntry?.credits || 3,
          instructor: pMeta.instructor,
          statusText: `ENROLLED // ${catEntry?.tier?.toUpperCase() || 'ELECTIVE'}`,
          bonusText: pMeta.bonus55e,
          enrolled: true,
        });
      }
      if (sMeta) {
        const catEntry = KAMP_COURSE_CATALOG.find((c) => c.code === sElecCode);
        customCourses.push({
          id: sElecCode.toLowerCase(),
          dept: (catEntry?.dept || 'SPH') as any,
          code: sElecCode,
          tier: catEntry?.tier || 'Tier B - Beginner',
          title: `${sElecCode}: ${sMeta.title}`,
          credits: catEntry?.credits || 2,
          instructor: sMeta.instructor,
          statusText: `ENROLLED // ${catEntry?.tier?.toUpperCase() || 'ELECTIVE'}`,
          bonusText: sMeta.bonus55e,
          enrolled: true,
        });
      }

      // Add default Senior Mastery capstone
      customCourses.push(DEFAULT_COURSES[9]);
      // Add Zyng Prereq
      customCourses.push(DEFAULT_COURSES[10]);

      setCourses(customCourses);
    }
  }, [
    activeCharacter?.id,
    activeCharacter?.kampProfile?.primaryElective,
    activeCharacter?.kampProfile?.secondaryElective,
  ]);

  const filteredCatalog = useMemo(() => {
    return KAMP_COURSE_CATALOG.filter((c) => {
      // Dept filter
      if (courseFilterDept !== 'ALL') {
        if (courseFilterDept === 'CORE' && c.dept !== 'CORE') return false;
        if (courseFilterDept === 'GRY' && c.dept !== 'GRY') return false;
        if (courseFilterDept === 'SPH' && c.dept !== 'SPH') return false;
        if (courseFilterDept === 'HYD' && c.dept !== 'HYD') return false;
        if (courseFilterDept === 'UNI' && c.dept !== 'UNI') return false;
        if (courseFilterDept === 'LEG/DIV/HRT' && !['LEG', 'DIV', 'HRT'].includes(c.dept)) return false;
        if (courseFilterDept === 'EXT' && c.dept !== 'EXT') return false;
      }
      // Tier filter
      if (courseFilterTier !== 'ALL') {
        if (courseFilterTier === 'Core' && c.tier !== 'Mandatory Core') return false;
        if (courseFilterTier === 'Beginner' && !c.tier.includes('Beginner')) return false;
        if (courseFilterTier === 'Advanced' && !c.tier.includes('Advanced')) return false;
        if (courseFilterTier === 'Mastery' && !c.tier.includes('Mastery')) return false;
        if (courseFilterTier === 'Extracurricular' && !c.tier.includes('Extracurricular')) return false;
      }
      // Search query
      if (courseSearchQuery.trim()) {
        const q = courseSearchQuery.toLowerCase();
        const match =
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.dnd55eBonus.toLowerCase().includes(q) ||
          c.college.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [courseFilterDept, courseFilterTier, courseSearchQuery]);

  const filteredFaculty = useMemo(() => {
    if (facultyFilter === 'ALL') return KAMP_FACULTY_ROSTER;
    return KAMP_FACULTY_ROSTER.filter((f) => f.houseAffiliation === facultyFilter);
  }, [facultyFilter]);

  if (showSortingQuiz) {
    return (
      <div className="w-full h-full bg-stone-900 overflow-y-auto p-3 sm:p-6">
        <KAMPSortingQuiz
          isEmbedded={true}
          onClose={() => setShowSortingQuiz(false)}
          onCompleteAndOpenKodex={() => {
            setShowSortingQuiz(false);
            setCommitMessage('K.A.M.P. SORTING EVALUATION COMPLETE // HOUSE & COURSE SCHEDULE SYNCED');
            setTimeout(() => setCommitMessage(null), 4000);
          }}
        />
      </div>
    );
  }

  // Derive student display fields
  const cadetName = activeCharacter?.name || 'Cadet Valerius Vance';
  const cadetSubtitle = activeCharacter?.title
    ? `of ${activeCharacter.title}`
    : `of House ${cadetName.split(' ').pop() || 'Vance'} of Sol`;
  const cadetId = activeCharacter?.id
    ? `#${activeCharacter.id.substring(0, 3).toUpperCase()}-VR`
    : '#892-VR';
  const rawHouse = activeCharacter?.kampProfile?.houseName || 'Gryffon';
  const houseKey: 'Gryffon' | 'Sphynx' | 'Hydra' | 'Unicorn' =
    rawHouse.includes('Spynx') || rawHouse.includes('Sphynx')
      ? 'Sphynx'
      : rawHouse.includes('Hydra')
      ? 'Hydra'
      : rawHouse.includes('Unycorn') || rawHouse.includes('Unicorn')
      ? 'Unicorn'
      : 'Gryffon';
  const houseName = `House ${houseKey}`;
  const yearStanding = activeCharacter?.kampProfile?.yearOfStudy
    ? `${activeCharacter.kampProfile.yearOfStudy} (Ovester 1)`
    : 'Senior Cadet (Term 5 Standing)';
  const classLine = activeCharacter
    ? `${activeCharacter.characterClass}${activeCharacter.subclass ? ` / ${activeCharacter.subclass}` : ''} Lv. ${activeCharacter.level}`
    : 'Warmage / Evoker Lv. 3';
  const dormLine = activeCharacter?.kampProfile?.dormitory || 'Lyvia Provydence Quad, Dorm II';

  // Credit calculation by academic phase
  const coreCredits = courses.filter((c) => c.dept === 'CORE' && c.enrolled).reduce((acc, c) => acc + c.credits, 0);
  const electiveCredits = courses
    .filter((c) => c.dept !== 'CORE' && !c.tier.includes('Mastery') && c.dept !== 'EXT' && c.enrolled)
    .reduce((acc, c) => acc + c.credits, 0);
  const masteryCourses = courses.filter((c) => c.tier.includes('Mastery') && c.enrolled);
  const masteryCredits = masteryCourses.reduce((acc, c) => acc + c.credits, 0);
  const extraCredits = courses.filter((c) => c.dept === 'EXT' && c.enrolled).reduce((acc, c) => acc + c.credits, 0);
  const totalEnrolledCredits = coreCredits + electiveCredits + masteryCredits + extraCredits;
  const progressPercent = Math.min(100, Math.round((totalEnrolledCredits / 30) * 1000) / 10);

  const handleToggleCourse = (id: string) => {
    playOptionSelect();
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newEnrolled = !c.enrolled;
          return {
            ...c,
            enrolled: newEnrolled,
            statusText: newEnrolled ? 'ENROLLED // ADVISOR SEALED' : 'PENDING ADVISOR SIGNATURE',
          };
        }
        return c;
      })
    );
  };

  const handleAddCatalogCourseToTranscript = (entry: KAMPCourseCatalogEntry) => {
    playOptionSelect();
    const exists = courses.some((c) => c.code === entry.code);
    if (exists) {
      setCourses((prev) => prev.filter((c) => c.code !== entry.code));
      setCommitMessage(`DROPPED ${entry.code} FROM ACTIVE TRANSCRIPT`);
    } else {
      // Enforce the strict institutional limit: ONE Mastery (M) Capstone course in Term 5!
      if (entry.tier.includes('Mastery')) {
        const existingMastery = courses.filter((c) => c.tier.includes('Mastery') && c.enrolled);
        if (existingMastery.length >= 1) {
          setCommitMessage(
            `ACADEMIC REGULATION LIMIT: Senior cadets strictly restricted to 1 Mastery Capstone course (5 Cr) due to Vertazyum consumption!`
          );
          setTimeout(() => setCommitMessage(null), 4500);
          return;
        }
      }

      setCourses((prev) => [
        ...prev,
        {
          id: entry.id,
          dept: entry.dept,
          code: entry.code,
          tier: entry.tier,
          title: `${entry.code}: ${entry.title}`,
          credits: entry.credits,
          instructor: entry.instructor,
          statusText: `ENROLLED // ${entry.tier.toUpperCase()}`,
          bonusText: entry.dnd55eBonus,
          enrolled: true,
        },
      ]);
      setCommitMessage(`ADDED ${entry.code} (${entry.credits} CR) TO CADET TRANSCRIPT`);
    }
    setTimeout(() => setCommitMessage(null), 3500);
  };

  const handleEnrollInPathway = (pathway: string[]) => {
    playDivineReveal();
    let addedCount = 0;
    setCourses((prev) => {
      const updated = [...prev];
      pathway.forEach((code) => {
        const catEntry = KAMP_COURSE_CATALOG.find((c) => c.code === code);
        if (catEntry && !updated.some((c) => c.code === code)) {
          // Check mastery cap
          if (catEntry.tier.includes('Mastery')) {
            const hasMastery = updated.some((c) => c.tier.includes('Mastery') && c.enrolled);
            if (hasMastery) return;
          }
          updated.push({
            id: catEntry.id,
            dept: catEntry.dept,
            code: catEntry.code,
            tier: catEntry.tier,
            title: `${catEntry.code}: ${catEntry.title}`,
            credits: catEntry.credits,
            instructor: catEntry.instructor,
            statusText: `ENROLLED // ${catEntry.tier.toUpperCase()}`,
            bonusText: catEntry.dnd55eBonus,
            enrolled: true,
          });
          addedCount++;
        }
      });
      return updated;
    });
    setCommitMessage(`ENROLLED IN MULTICLASS PATHWAY // ${addedCount} COURSES ADDED TO TRANSCRIPT`);
    setTimeout(() => setCommitMessage(null), 4000);
  };

  const handleReSanctify = () => {
    playDivineReveal();
    setSanctifiedPulse(true);
    setCommitMessage('SIGNET BAY RE-SANCTIFIED // BLOOD SIGNATURE VERIFIED BY HEADMYSTREXX SATYSFACTION');
    setTimeout(() => setSanctifiedPulse(false), 1200);
    setTimeout(() => setCommitMessage(null), 3200);
  };

  const handleCommitSchedule = () => {
    playKeyClick();
    setCommitMessage(
      `TERM SCHEDULE COMMITTED // ${totalEnrolledCredits} / 30 CREDITS LOCKED IN THE K.A.M.P. REGISTRAR`
    );
    setTimeout(() => setCommitMessage(null), 3500);
  };

  return (
    <div className="w-full h-full bg-[#171214] overflow-y-auto p-3 sm:p-6 select-none overflow-x-hidden text-[#111111]">
      {/* Main Chassis Container */}
      <div className="w-full max-w-[1320px] mx-auto slate-masonry rounded-3xl p-4 sm:p-8 relative mb-10">
        {/* Hardware Corner Brackets */}
        <div className="absolute -top-3 -left-3 w-14 h-14 sm:w-16 sm:h-16 bg-[#1f2022] rounded-lg border-2 border-[#383838] flex items-center justify-center shadow-md z-30">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#171718] border border-[#2b2b2d] rotate-45 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 eink-corner-disc -rotate-45 rounded-sm" />
          </div>
          <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#555] border border-[#222]" />
          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#555] border border-[#222]" />
        </div>

        <div className="absolute -top-3 -right-3 w-14 h-14 sm:w-16 sm:h-16 bg-[#1f2022] rounded-lg border-2 border-[#383838] flex items-center justify-center shadow-md z-30">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#171718] border border-[#2b2b2d] rotate-45 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 eink-corner-disc -rotate-45 rounded-sm" />
          </div>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#555] border border-[#222]" />
          <span className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[#555] border border-[#222]" />
        </div>

        <div className="absolute -bottom-3 -right-3 w-14 h-14 sm:w-16 sm:h-16 bg-[#1f2022] rounded-lg border-2 border-[#383838] flex items-center justify-center shadow-md z-30">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#171718] border border-[#2b2b2d] rotate-45 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 eink-corner-disc -rotate-45 rounded-sm" />
          </div>
          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#555] border border-[#222]" />
          <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#555] border border-[#222]" />
        </div>

        {/* Left Hardware Margin Accents */}
        <div
          className="hidden lg:flex flex-col items-center gap-6 absolute -left-5 top-28 z-20"
          data-purpose="pneumatic-chassis-accents"
        >
          <div className="w-10 h-10 rounded-full bg-[#1b1b1c] border-2 border-[#444] flex items-center justify-center shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#ebebe6] border border-[#222] relative flex items-center justify-center">
              <div className="w-3 h-0.5 bg-[#8b1e1e] origin-left rotate-45" />
              <div className="w-1 h-1 rounded-full bg-[#111]" />
            </div>
          </div>
          <div className="w-2.5 h-36 bg-[#19191a] rounded-full border border-[#383838]" />
          <div className="w-4 h-16 bg-[#141414] border border-[#333] rounded-full p-0.5 flex flex-col justify-end">
            <div className="w-full h-3/4 bg-[#8b1e1e] rounded-full" />
          </div>
        </div>

        {/* Slate Screen Bezel (Chiseled Marble & Dark Red E-Ink Surface) */}
        <div className="marble-slab rounded-2xl p-4 sm:p-7 border-2 border-[#1c1d1e] shadow-inner relative overflow-hidden">
          {/* Watermark Woodcut Compass in Center */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.045] flex items-center justify-center">
            <div className="w-[580px] h-[580px] rounded-full border-[18px] border-[#450a0a] flex items-center justify-center">
              <div className="w-[420px] h-[420px] border-8 border-dashed border-[#450a0a] rotate-45" />
            </div>
          </div>

          {/* Academic Top Header */}
          <header className="relative border-b-2 border-[#111111] pb-4 mb-5" data-purpose="academic-header">
            {/* Header Telemetry Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs kodex-font-mono font-semibold tracking-wider text-[#4a4a4a] mb-3 border-b border-stone-400 pb-2">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b1e1e] inline-block" />
                <span className="text-[#450a0a]">
                  LYVIA PROVYDENCE MATRIX: <span className="text-[#8b1e1e] font-bold">884.2 mHz</span>
                </span>
                <span className="text-stone-400">|</span>
                <span className="text-[#4a4a4a]">
                  BLOOD-BOUND SEAL: <span className="text-[#8b1e1e] font-bold">AUTHENTICATED [X]</span>
                </span>
                <span className="text-stone-400">|</span>
                <span className="text-[#7f1d1d] font-bold">
                  DEGREE REQUIREMENT: 30 CREDITS
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <span className="bg-[#fcf0f0] px-2 py-0.5 rounded border border-[#8b1e1e] text-[#7f1d1d]">
                  Standing: <strong className="text-[#450a0a]">{yearStanding}</strong>
                </span>
                <div className="flex items-center gap-1.5 bg-[#7f1d1d] text-[#fef2f2] text-[11px] px-2.5 py-0.5 rounded-full border border-[#450a0a] shadow-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fef2f2]" />
                  <span>
                    Registrars: <strong>Applebaum &amp; Satysfaction</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Academy Crest, Title, and Motto */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-full max-w-md mx-auto mb-1 flex items-center justify-center gap-4">
                <svg
                  className="h-16 w-auto text-[#7f1d1d]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.25"
                  viewBox="0 0 360 80"
                >
                  <path d="M 20 65 L 180 50 L 340 65" />
                  <path d="M 30 72 L 180 57 L 330 72" />
                  <circle cx="180" cy="36" r="28" strokeWidth="1.75" />
                  <circle cx="180" cy="36" r="24" strokeDasharray="3 2" />
                  <path
                    d="M 166 42 Q 180 37 180 32 Q 180 37 194 42 L 194 28 Q 180 24 180 20 Q 180 24 166 28 Z"
                    fill="#8b1e1e"
                  />
                  <line x1="180" y1="12" x2="180" y2="60" strokeWidth="1.5" />
                  <line x1="156" y1="36" x2="204" y2="36" strokeWidth="1.5" />
                </svg>
              </div>

              <h1 className="kodex-font-title text-2xl sm:text-3xl font-extrabold tracking-wider text-[#111111] uppercase">
                Konran Academy of Might &amp; Proficiency
              </h1>
              <p className="kodex-font-fell text-xs sm:text-sm text-[#4a4a4a] italic max-w-2xl mt-0.5">
                "Proficientia Per Augmentum, Vis Per Unitatem" — The Lyvia Provydence Estate
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="h-[1px] w-8 sm:w-12 bg-[#8b1e1e]" />
                <span className="kodex-font-cinzel text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#450a0a] uppercase">
                  THE K.A.M.P. KODEX • 5-COLLEGE CURRICULUM ARCHITECTURE • v5.5
                </span>
                <span className="h-[1px] w-8 sm:w-12 bg-[#8b1e1e]" />
              </div>
            </div>

            {/* Kodex Navigation Tabs */}
            <div className="mt-4 pt-3 border-t border-stone-400 flex flex-wrap items-center justify-center gap-2">
              {(
                [
                  { id: 'dossier', label: 'I. Cadet Dossier & Transcript' },
                  { id: 'catalogue', label: `II. Course Catalogue (${KAMP_COURSE_CATALOG.length} Courses)` },
                  { id: 'pathways', label: 'III. Multiclassing Archetypes' },
                  { id: 'faculty', label: `IV. Faculty & Legends (${KAMP_FACULTY_ROSTER.length})` },
                  { id: 'campus', label: 'V. Four Houses, Zyng! & Lyvia Quad' },
                ] as { id: KodexSubTab; label: string }[]
              ).map((tab) => {
                const active = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playOptionSelect();
                      setActiveSubTab(tab.id);
                    }}
                    className={`px-3.5 py-1.5 text-xs kodex-font-cinzel font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      active
                        ? 'bg-[#7f1d1d] text-[#fef2f2] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
                        : 'bg-[#fafaf7] text-[#450a0a] border-[1.5px] border-[#111111] hover:bg-[#fcf0f0] shadow-[2px_2px_0px_#111111]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </header>

          {/* System Notification Banner */}
          {commitMessage && (
            <div className="mb-4 px-3 py-2 bg-[#fcf0f0] border-2 border-[#8b1e1e] text-[#7f1d1d] kodex-font-mono text-xs font-bold text-center uppercase tracking-wider animate-pulse">
              {commitMessage}
            </div>
          )}

          {/* Tower Library Drawer */}
          {showLibraryNotice && (
            <div className="mb-5 p-4 bg-[#fafaf7] border-2 border-[#111111] rounded-lg kodex-font-cinzel text-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-stone-300 pb-1">
                <span className="font-bold text-[#7f1d1d] uppercase tracking-wider">
                  K.A.M.P. Restricted Tower Library Stacks // Head Librarian Kanessa Applebaum
                </span>
                <button
                  type="button"
                  onClick={() => setShowLibraryNotice(false)}
                  className="kodex-font-mono text-[10px] underline text-[#111111] cursor-pointer"
                >
                  [CLOSE STACKS]
                </button>
              </div>
              <p className="text-[#4a4a4a] italic">
                1. "Screaming Hearts &amp; Bottled Nightshade: Complete Potions Vol. IV" — Sympkin Sylverflask • 2. "Dinners with the Nine Emissaries" — Primadonna Tao • 3. "Magnetic Alloys Across Ten Realms" — Retcod Olloppa • 4. "Flameless Mind-Forging" — Goggers Smoothsmyth • 5. "Zyng! Tactical Flight Mechanics" — Professor Yvctus.
              </p>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: CADET DOSSIER & ACTIVE 30-CREDIT TRANSCRIPT                */}
          {/* ================================================================= */}
          {activeSubTab === 'dossier' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {!isCompactSlate && (
                <section className="lg:col-span-5 flex flex-col gap-5" data-purpose="student-enrollment-covenant">
                  {/* Student Dossier Card */}
                  <div className="bg-[#fafaf7] rounded-xl border-2 border-[#111111] p-4 shadow-[3px_3px_0px_#111111] relative overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div className="w-20 h-22 p-1.5 border-2 border-[#8b1e1e] bg-[#fcf5f5] flex flex-col items-center justify-center">
                          <svg
                            className="w-14 h-16 text-[#8b1e1e]"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            viewBox="0 0 60 70"
                          >
                            <path
                              d="M 6 8 L 54 8 L 54 36 C 54 52 30 65 30 65 C 30 65 6 52 6 36 Z"
                              strokeWidth="1.75"
                            />
                            <path
                              d="M 12 14 L 48 14 L 48 35 C 48 47 30 58 30 58 C 30 58 12 47 12 35 Z"
                              strokeDasharray="2 2"
                              strokeWidth="1"
                            />
                            <circle cx="30" cy="30" r="10" strokeWidth="1.5" />
                            <path d="M 30 20 L 30 40 M 20 30 L 40 30" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <span className="text-[10px] kodex-font-mono font-bold text-[#8b1e1e] mt-1">
                          CADET #{cadetId}
                        </span>
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] kodex-font-mono font-bold uppercase px-2 py-0.5 bg-[#7f1d1d] text-[#fef2f2]">
                            {houseName}
                          </span>
                          <span className="text-[10px] kodex-font-mono text-[#8b1e1e] font-bold">
                            STATUS: ACTIVE
                          </span>
                        </div>
                        <h2 className="kodex-font-title text-lg font-bold text-[#111111] leading-tight">
                          {cadetName}
                        </h2>
                        <p className="text-xs kodex-font-fell italic text-[#4a4a4a]">{cadetSubtitle}</p>
                        <div className="pt-1.5 border-t border-stone-300 text-xs kodex-font-cinzel text-[#222222] space-y-0.5">
                          <div>
                            Class Track: <strong>{classLine}</strong>
                          </div>
                          <div>
                            Dormitory: <span className="text-[#7f1d1d] font-semibold">{dormLine}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Academic Phase Breakdown Metrics */}
                    <div className="mt-4 pt-3 border-t border-[#111111] grid grid-cols-3 gap-2 text-center text-xs kodex-font-mono">
                      <div className="bg-[#fcf0f0] p-2 border border-[#8b1e1e]">
                        <div className="text-[10px] text-[#7f1d1d] uppercase font-bold">I. Mandatory Core</div>
                        <div className="text-base font-bold text-[#450a0a]">{coreCredits} / 12 Cr</div>
                        <div className="text-[9px] text-stone-500">Terms 1–2 (Req)</div>
                      </div>
                      <div className="bg-[#f5f5f0] p-2 border border-[#111111]">
                        <div className="text-[10px] text-[#111111] uppercase font-bold">II. Electives</div>
                        <div className="text-base font-bold text-[#111111]">{electiveCredits} / 13-15 Cr</div>
                        <div className="text-[9px] text-stone-500">Terms 3–4 (Open)</div>
                      </div>
                      <div className="bg-[#fcf0f0] p-2 border border-[#8b1e1e]">
                        <div className="text-[10px] text-[#7f1d1d] uppercase font-bold">III. Capstone (M)</div>
                        <div className="text-base font-bold text-[#450a0a]">{masteryCredits} / 5 Cr</div>
                        <div className="text-[9px] text-[#7f1d1d] font-bold">Max 1 Mastery</div>
                      </div>
                    </div>
                  </div>

                  {/* Institutional Credit Cap Rule Warning Box */}
                  <div className="bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-3.5 shadow-[3px_3px_0px_#111111] text-xs kodex-font-fell space-y-1.5">
                    <div className="flex items-center gap-2 text-[#7f1d1d] font-bold kodex-font-cinzel uppercase text-xs">
                      <span>❖</span>
                      <span>K.A.M.P. Institutional Credit Regulations</span>
                    </div>
                    <p className="text-[#333333] leading-relaxed">
                      Graduation requires a minimum accumulation of <strong>30 Academic Credits</strong> across 5 terms. In Term 5, institutional policy strictly restricts each senior to <strong>ONE Mastery (M) course</strong> worth 5 credits, due to rare crystalline material consumption (Vertazyum / Kraykatzyte).
                    </p>
                    <p className="text-[#7f1d1d] italic text-[11px]">
                      "House placement never restricts course enrollment across collegiate lines." — K.A.M.P. Open Credit Charter
                    </p>
                  </div>
                </section>
              )}

              {/* Active Transcript & Graduation Meter */}
              <section className={isCompactSlate ? 'lg:col-span-12' : 'lg:col-span-7'} data-purpose="coursework-transcript">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#111111] pb-2 mb-3">
                    <div>
                      <h3 className="kodex-font-title text-base sm:text-lg text-[#7f1d1d] font-bold">
                        Cadet Transcript &amp; Coursework Ledger ({courses.length} Courses)
                      </h3>
                      <p className="kodex-font-fell text-xs text-[#4a4a4a]">
                        Click any course to seal/unseal advisor signature, or browse the Catalogue tab to add electives.
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs kodex-font-mono font-bold text-[#fef2f2] bg-[#7f1d1d] px-2.5 py-1 border border-[#450a0a]">
                        Total Units: {totalEnrolledCredits} / 30 Cr
                      </span>
                    </div>
                  </div>

                  {/* Course Cards List */}
                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {courses.map((course) => (
                      <article
                        key={course.id}
                        onClick={() => handleToggleCourse(course.id)}
                        className={`course-card rounded-lg p-3 relative flex flex-col gap-1.5 cursor-pointer ${
                          !course.enrolled ? 'border-dashed border-[#555] bg-[#f5f5f0]' : ''
                        }`}
                        title="Click to toggle advisor signature / enrollment seal"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 h-6 text-[10px] kodex-font-mono font-bold flex items-center justify-center border ${
                                course.enrolled
                                  ? 'bg-[#7f1d1d] text-[#fef2f2] border-[#450a0a]'
                                  : 'bg-transparent text-[#8b1e1e] border-[#8b1e1e]'
                              }`}
                            >
                              {course.dept}
                            </span>
                            <div>
                              <h4
                                className={`kodex-font-cinzel text-xs sm:text-sm font-bold ${
                                  course.enrolled ? 'text-[#450a0a]' : 'text-[#7f1d1d]'
                                }`}
                              >
                                {course.title}
                              </h4>
                              <span className="text-[10px] kodex-font-mono uppercase font-semibold text-[#8b1e1e]">
                                {course.tier}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`kodex-font-mono text-xs font-bold border border-[#8b1e1e] px-2 py-0.5 shrink-0 ${
                              course.enrolled ? 'text-[#7f1d1d] bg-[#fdf2f2]' : 'text-[#8b1e1e] bg-[#fbf0f0]'
                            }`}
                          >
                            {course.credits} Cr
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4a4a4a] pl-9">
                          <span>
                            Instructor:{' '}
                            <strong className={course.enrolled ? 'text-[#111111]' : 'text-[#4a4a4a]'}>
                              {course.instructor}
                            </strong>
                          </span>
                          {course.enrolled ? (
                            <div className="flex items-center gap-1.5 text-[#7f1d1d] kodex-font-cinzel text-[11px] font-bold">
                              <span className="inline-block w-3.5 h-3.5 bg-[#7f1d1d] text-[#fef2f2] text-[9px] text-center leading-[14px]">
                                ✓
                              </span>
                              <span>{course.statusText}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[#8b1e1e] kodex-font-cinzel text-[11px] font-bold">
                              <span className="w-3.5 h-3.5 rounded-full border border-[#8b1e1e] inline-block" />
                              <span>{course.statusText}</span>
                            </div>
                          )}
                        </div>

                        <div
                          className={`ml-9 mt-0.5 bg-[#fbf2f2] border-l-2 border-[#8b1e1e] px-2 py-1 text-[11px] kodex-font-mono ${
                            course.enrolled ? 'text-[#450a0a]' : 'text-[#7f1d1d]'
                          }`}
                        >
                          <strong className="text-[#7f1d1d] kodex-font-cinzel">5.5e Boon:</strong>{' '}
                          {course.bonusText}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Graduation Progress Bar */}
                <div className="mt-4 pt-3 border-t border-[#111111]" data-purpose="graduation-meter">
                  <div className="flex items-center justify-between text-xs kodex-font-cinzel font-bold text-[#7f1d1d] mb-1.5">
                    <span>GRADUATION PROGRESS (5-TERM DIPLOMA MATRIX)</span>
                    <span className="kodex-font-mono text-[#8b1e1e]">
                      {totalEnrolledCredits} / 30 CREDITS ACCUMULATED ({Math.round(progressPercent)}%)
                    </span>
                  </div>
                  <div className="h-4 bg-[#f8efef] rounded-none p-0.5 border-2 border-[#8b1e1e] relative overflow-hidden flex items-center">
                    <div
                      className="h-full bg-[#8b1e1e] relative transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute inset-0 eink-dither opacity-90" />
                    </div>
                    <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
                      <span className="h-full w-px bg-[#450a0a]" />
                      <span className="h-full w-px bg-[#450a0a]" />
                      <span className="h-full w-px bg-[#450a0a]" />
                      <span className="h-full w-px bg-[#450a0a]" />
                      <span className="h-full w-px bg-[#450a0a]" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: FULL K.A.M.P. COURSE CATALOGUE (22 PRIMARY + CORE + ZYNG)  */}
          {/* ================================================================= */}
          {activeSubTab === 'catalogue' && (
            <div className="space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-3">
                <div>
                  <h3 className="kodex-font-title text-lg text-[#7f1d1d] font-bold">
                    Official K.A.M.P. Curriculum Registry &amp; 5.5e Mechanical Boons
                  </h3>
                  <p className="kodex-font-fell text-xs text-[#4a4a4a]">
                    22 primary courses across 5 degree-granting colleges: 6 Core (Terms 1–2), 5 Beginner (B), 7 Advanced (A), 10 Mastery (M), and 2 Extracurricular Zyng! modules.
                  </p>
                </div>
                {/* Search Box */}
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    placeholder="Search by code, title, boon..."
                    className="w-full bg-[#fafaf7] border border-[#111111] px-2.5 py-1 text-xs kodex-font-mono text-[#111111] focus:outline-none focus:border-[#7f1d1d]"
                  />
                </div>
              </div>

              {/* Department & Tier Dual Filters */}
              <div className="flex flex-col gap-2 bg-[#fcf5f5] p-2.5 border border-[#8b1e1e]">
                <div className="flex items-center gap-1.5 flex-wrap text-xs kodex-font-mono">
                  <span className="font-bold text-[#7f1d1d] uppercase pr-1">College:</span>
                  {[
                    { id: 'ALL', label: 'All Colleges' },
                    { id: 'CORE', label: 'Mandatory Core' },
                    { id: 'GRY', label: 'Vanguard (GRY)' },
                    { id: 'SPH', label: 'Magitech (SPH)' },
                    { id: 'HYD', label: 'Arcanum (HYD)' },
                    { id: 'UNI', label: 'Fine Arts (UNI)' },
                    { id: 'LEG/DIV/HRT', label: 'Law / Faith / Hearth' },
                    { id: 'EXT', label: 'Athletics (Zyng!)' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setCourseFilterDept(filter.id);
                      }}
                      className={`px-2 py-0.5 text-[11px] font-bold uppercase cursor-pointer border ${
                        courseFilterDept === filter.id
                          ? 'bg-[#7f1d1d] text-[#fef2f2] border-[#111111]'
                          : 'bg-[#fafaf7] text-[#111111] border-stone-300 hover:bg-[#fcf0f0]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-xs kodex-font-mono border-t border-[#8b1e1e]/20 pt-1.5">
                  <span className="font-bold text-[#7f1d1d] uppercase pr-1">Tier:</span>
                  {[
                    { id: 'ALL', label: 'All Tiers' },
                    { id: 'Core', label: 'Core (2 Cr)' },
                    { id: 'Beginner', label: 'Beginner B (2 Cr)' },
                    { id: 'Advanced', label: 'Advanced A (3 Cr)' },
                    { id: 'Mastery', label: 'Mastery M (5 Cr - Max 1)' },
                    { id: 'Extracurricular', label: 'Extracurricular' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setCourseFilterTier(filter.id);
                      }}
                      className={`px-2 py-0.5 text-[11px] font-bold uppercase cursor-pointer border ${
                        courseFilterTier === filter.id
                          ? 'bg-[#450a0a] text-[#fef2f2] border-[#111111]'
                          : 'bg-[#fafaf7] text-[#4a4a4a] border-stone-300 hover:bg-[#fcf0f0]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredCatalog.map((entry) => {
                  const isEnrolledInTranscript = courses.some((c) => c.code === entry.code);
                  return (
                    <div
                      key={entry.id}
                      className="course-card rounded-lg p-3.5 flex flex-col justify-between gap-2 bg-[#fafaf7] border-2 border-[#111111]"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-[#7f1d1d] text-[#fef2f2] kodex-font-mono text-xs font-bold border border-[#111111]">
                              {entry.code}
                            </span>
                            <span className="text-[10px] kodex-font-mono uppercase font-bold px-2 py-0.5 bg-[#fcf0f0] text-[#7f1d1d] border border-[#8b1e1e]">
                              {entry.tier}
                            </span>
                            <span className="text-[9px] kodex-font-mono uppercase font-semibold text-stone-600">
                              {entry.termLevel}
                            </span>
                          </div>
                          <span className="kodex-font-mono text-xs font-bold text-[#450a0a] bg-[#f5f5f0] border border-[#111111] px-2 py-0.5 shrink-0">
                            {entry.credits} Cr
                          </span>
                        </div>

                        <h4 className="kodex-font-title text-sm sm:text-base font-bold text-[#111111]">
                          {entry.title}
                        </h4>

                        <div className="text-xs kodex-font-cinzel text-[#4a4a4a] flex flex-wrap justify-between gap-1 border-b border-stone-300 pb-1">
                          <span>
                            Instructor: <strong className="text-[#7f1d1d]">{entry.instructor}</strong>
                          </span>
                          <span className="kodex-font-mono text-[10px] text-[#111111]">
                            {entry.location}
                          </span>
                        </div>

                        <p className="text-xs kodex-font-fell text-[#222222] leading-relaxed">
                          {entry.description}
                        </p>

                        <div className="text-[11px] text-[#4a4a4a] italic">
                          <strong>Prerequisites:</strong> {entry.prerequisites}
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="bg-[#fcf0f0] border-l-2 border-[#8b1e1e] px-2.5 py-1.5 text-[11px] kodex-font-mono text-[#450a0a]">
                          <strong className="text-[#7f1d1d] uppercase">5.5e Mechanical Boon:</strong>{' '}
                          {entry.dnd55eBonus}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] kodex-font-mono text-[#4a4a4a]">
                            {entry.scheduleBlock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddCatalogCourseToTranscript(entry)}
                            className={`px-3 py-1 text-[11px] kodex-font-cinzel font-bold uppercase cursor-pointer border border-[#111111] transition-colors ${
                              isEnrolledInTranscript
                                ? 'bg-[#111111] text-[#f5f5f0]'
                                : 'bg-[#fcf0f0] text-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white'
                            }`}
                          >
                            {isEnrolledInTranscript ? '✓ On Transcript (Remove)' : '+ Add to Transcript'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: MULTICLASSING ARCHETYPES & CURRICULAR PATHWAYS             */}
          {/* ================================================================= */}
          {activeSubTab === 'pathways' && (
            <div className="space-y-4 relative z-10">
              <div className="border-b-2 border-[#111111] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="kodex-font-title text-lg text-[#7f1d1d] font-bold">
                    Canonical Multiclassing Pathways &amp; D&amp;D 5.5e Growth
                  </h3>
                  <p className="kodex-font-fell text-xs text-[#4a4a4a]">
                    K.A.M.P.'s elective structure translates table mechanics and character advancement into cohesive in-world scholastic achievements.
                  </p>
                </div>
                <span className="kodex-font-mono text-xs font-bold bg-[#7f1d1d] text-[#fef2f2] px-3 py-1 border border-[#111111]">
                  FIVE TARGET ARCHETYPES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KAMP_MULTICLASS_PATHWAYS.map((p) => {
                  return (
                    <div
                      key={p.archetype}
                      className="course-card rounded-xl p-4 bg-[#fafaf7] border-2 border-[#111111] space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                          <div>
                            <h4 className="kodex-font-title text-base font-bold text-[#7f1d1d]">
                              {p.archetype}
                            </h4>
                            <span className="text-[11px] kodex-font-mono font-bold text-[#111111]">
                              Classes: {p.classes}
                            </span>
                          </div>
                          <span className="text-[10px] kodex-font-mono uppercase font-bold px-2 py-0.5 bg-[#fcf0f0] text-[#7f1d1d] border border-[#8b1e1e]">
                            4-Course Track
                          </span>
                        </div>

                        {/* Pathway Flow Diagram */}
                        <div className="flex items-center gap-1.5 flex-wrap py-1">
                          {p.pathway.map((step, idx) => (
                            <React.Fragment key={step}>
                              <span className="px-2 py-1 bg-[#fcf0f0] border border-[#8b1e1e] font-mono text-xs font-bold text-[#7f1d1d]">
                                {step}
                              </span>
                              {idx < p.pathway.length - 1 && (
                                <span className="text-stone-400 font-bold">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <p className="text-xs kodex-font-fell text-[#222222] leading-relaxed">
                          <strong>Scholastic Milestone:</strong> {p.milestone}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-300 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleEnrollInPathway(p.pathway)}
                          className="px-3 py-1.5 bg-[#7f1d1d] text-[#fef2f2] hover:bg-[#450a0a] text-xs kodex-font-cinzel font-bold uppercase cursor-pointer border border-[#111111]"
                        >
                          + Enroll In {p.archetype}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Collegiate Bodies Reference Table */}
              <div className="mt-5 bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-4 space-y-3">
                <h4 className="kodex-font-title text-base font-bold text-[#7f1d1d] uppercase border-b border-stone-300 pb-1.5">
                  The Five Degree-Granting Colleges of K.A.M.P.
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs kodex-font-cinzel border-collapse">
                    <thead>
                      <tr className="bg-[#fcf0f0] border-b-2 border-[#111111] text-[#7f1d1d]">
                        <th className="p-2 border border-stone-300">Collegiate Body</th>
                        <th className="p-2 border border-stone-300">Code</th>
                        <th className="p-2 border border-stone-300">Core Departments</th>
                        <th className="p-2 border border-stone-300">Career Focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {KAMP_COLLEGES.map((c) => (
                        <tr key={c.code} className="hover:bg-[#fcf5f5] text-[#222222]">
                          <td className="p-2 border border-stone-300 font-bold">{c.name}</td>
                          <td className="p-2 border border-stone-300 font-mono font-bold text-[#7f1d1d]">{c.code}</td>
                          <td className="p-2 border border-stone-300">{c.departments}</td>
                          <td className="p-2 border border-stone-300">{c.careerFocus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: FACULTY & LEGENDS DIRECTORY                                */}
          {/* ================================================================= */}
          {activeSubTab === 'faculty' && (
            <div className="space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-3">
                <div>
                  <h3 className="kodex-font-title text-lg text-[#7f1d1d] font-bold">
                    K.A.M.P. Faculty, Hearthmistresses &amp; Accredited Legends
                  </h3>
                  <p className="kodex-font-fell text-xs text-[#4a4a4a]">
                    Canonical dossier of instructors, species, Declared Patron Gods, and club sponsorships across the Lyvia Provydence estate.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'Administration', 'Gryffon', 'Sphynx', 'Hydra', 'Unicorn'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setFacultyFilter(filter);
                      }}
                      className={`px-2.5 py-1 text-xs kodex-font-mono font-bold uppercase cursor-pointer border border-[#111111] ${
                        facultyFilter === filter
                          ? 'bg-[#7f1d1d] text-[#fef2f2]'
                          : 'bg-[#fafaf7] text-[#111111] hover:bg-[#fcf0f0]'
                      }`}
                    >
                      {filter === 'ALL' ? 'All Staff' : filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Faculty Roster Grid */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[540px] overflow-y-auto pr-1">
                  {filteredFaculty.map((member) => {
                    const isSelected = selectedFaculty?.id === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          playOptionSelect();
                          setSelectedFaculty(member);
                        }}
                        className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#fcf0f0] border-[#8b1e1e] shadow-[3px_3px_0px_#8b1e1e]'
                            : 'bg-[#fafaf7] border-[#111111] hover:bg-[#f5f5f0] shadow-[2px_2px_0px_#111111]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] kodex-font-mono font-bold uppercase px-1.5 py-0.5 bg-[#7f1d1d] text-[#fef2f2]">
                              {member.houseAffiliation}
                            </span>
                            <span className="text-[10px] kodex-font-mono text-[#450a0a] font-bold">
                              Patron: {member.patronDeity}
                            </span>
                          </div>
                          <h4 className="kodex-font-title text-sm font-bold text-[#111111]">
                            {member.name}
                          </h4>
                          <p className="text-xs kodex-font-cinzel font-bold text-[#7f1d1d]">
                            {member.title}
                          </p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-stone-300 flex items-center justify-between text-[11px] kodex-font-mono text-[#4a4a4a]">
                          <span>Species: {member.species}</span>
                          <span className="text-[#8b1e1e] font-bold">Inspect →</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Faculty Detailed Dossier */}
                <div className="lg:col-span-5">
                  {selectedFaculty && (
                    <div className="bg-[#fafaf7] rounded-xl border-2 border-[#111111] p-5 shadow-[4px_4px_0px_#111111] space-y-3.5 sticky top-2">
                      <div className="border-b-2 border-[#8b1e1e] pb-3">
                        <div className="flex items-center justify-between text-xs kodex-font-mono text-[#7f1d1d] font-bold uppercase">
                          <span>FACULTY DOSSIER // {selectedFaculty.houseAffiliation}</span>
                          <span>SPECIES: {selectedFaculty.species.toUpperCase()}</span>
                        </div>
                        <h3 className="kodex-font-title text-xl font-bold text-[#111111] mt-1">
                          {selectedFaculty.name}
                        </h3>
                        <div className="text-xs kodex-font-cinzel font-bold text-[#8b1e1e] uppercase tracking-wider">
                          {selectedFaculty.title} — {selectedFaculty.role}
                        </div>
                      </div>

                      <div className="bg-[#fcf0f0] border border-[#8b1e1e] p-2.5 text-xs kodex-font-cinzel flex items-center justify-between">
                        <span className="text-[#4a4a4a]">Declared Worshipper Of:</span>
                        <strong className="text-[#7f1d1d] uppercase tracking-wider">
                          Church of {selectedFaculty.patronDeity}
                        </strong>
                      </div>

                      {selectedFaculty.quote && (
                        <blockquote className="p-3 bg-[#f5f5f0] border-l-4 border-[#7f1d1d] kodex-font-fell italic text-xs text-[#222222]">
                          "{selectedFaculty.quote}"
                        </blockquote>
                      )}

                      <p className="text-xs kodex-font-cinzel text-[#111111] leading-relaxed">
                        {selectedFaculty.bio}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-stone-300">
                        <div className="text-[11px] kodex-font-mono font-bold text-[#7f1d1d] uppercase">
                          Courses Instructed:
                        </div>
                        <ul className="space-y-1 text-xs kodex-font-cinzel text-[#111111]">
                          {selectedFaculty.coursesTaught.map((c, idx) => (
                            <li key={idx} className="bg-[#f5f5f0] px-2.5 py-1 border border-stone-300 font-semibold">
                              • {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-stone-300">
                        <div className="text-[11px] kodex-font-mono font-bold text-[#7f1d1d] uppercase">
                          Sponsored Clubs &amp; Campus Offices:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedFaculty.sponsoredClubs.map((club, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[#fcf0f0] border border-[#8b1e1e] text-[#450a0a] kodex-font-mono text-[11px] font-bold"
                            >
                              {club}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: FOUR PATHS, ATHLETICS (ZYNG!) & LYVIA QUAD                 */}
          {/* ================================================================= */}
          {activeSubTab === 'campus' && (
            <div className="space-y-5 relative z-10">
              <div className="border-b-2 border-[#111111] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="kodex-font-title text-lg text-[#7f1d1d] font-bold">
                    The Four Houses of K.A.M.P., Tactical Athletics &amp; Lyvia Estate
                  </h3>
                  <p className="kodex-font-fell text-xs text-[#4a4a4a]">
                    Every cadet contributes to the survival and splendor of the school—from border patrols to scroll archiving, greenhouse harvesting, and castle maintenance.
                  </p>
                </div>
                <span className="kodex-font-mono text-xs font-bold bg-[#7f1d1d] text-[#fef2f2] px-3 py-1 border border-[#111111]">
                  LOCATION: LYVIA PROVYDENCE (NORTH OF YGNOSI &amp; OTHENAEUM)
                </span>
              </div>

              {/* The Four Houses Lore Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['Gryffon', 'Sphynx', 'Hydra', 'Unicorn'] as const).map((hKey) => {
                  const lore = KAMP_HOUSE_LORE[hKey];
                  return (
                    <div
                      key={hKey}
                      className="course-card rounded-xl p-4 space-y-2.5 flex flex-col justify-between bg-[#fafaf7] border-2 border-[#111111]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                          <h4 className="kodex-font-title text-base font-bold text-[#7f1d1d] uppercase">
                            Path of the {lore.house}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {lore.pillars.map((p) => (
                              <span
                                key={p}
                                className="text-[10px] kodex-font-mono font-bold px-1.5 py-0.5 bg-[#fcf0f0] text-[#450a0a] border border-[#8b1e1e]"
                              >
                                ❖ {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        <blockquote className="p-2.5 bg-[#f5f5f0] border-l-3 border-[#8b1e1e] kodex-font-fell italic text-xs text-[#111111]">
                          "{lore.motto}" — <strong>{lore.quoteAuthor}</strong>
                        </blockquote>

                        <div className="text-xs kodex-font-cinzel text-[#222222] leading-relaxed">
                          <strong className="text-[#7f1d1d] uppercase kodex-font-mono text-[11px] block">
                            Mandatory Estate Work &amp; Campus Duty:
                          </strong>
                          {lore.campusDuty}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-stone-300">
                        <div className="text-[10px] kodex-font-mono font-bold text-[#450a0a] uppercase">
                          Sanctioned House Clubs &amp; Societies:
                        </div>
                        {lore.clubs.map((c) => (
                          <div key={c.name} className="bg-[#fcf0f0] p-2 border border-[#8b1e1e]/40 text-xs">
                            <div className="font-bold text-[#7f1d1d] kodex-font-cinzel">
                              {c.name}{' '}
                              <span className="text-[10px] kodex-font-mono text-[#4a4a4a] font-normal">
                                (Sponsor: {c.sponsor})
                              </span>
                            </div>
                            <div className="text-[11px] text-[#333333]">{c.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ZYNG! ATHLETICS DEEP-DIVE SECTION */}
              <div className="bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-5 shadow-[4px_4px_0px_#111111] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#8b1e1e] pb-2">
                  <div>
                    <span className="kodex-font-mono text-[10px] bg-[#7f1d1d] text-white px-2 py-0.5 uppercase font-bold">
                      OFFICIAL ACADEMIC ESPORT
                    </span>
                    <h3 className="kodex-font-title text-xl text-[#111111] font-bold mt-1">
                      Zyng! — High-Speed Tactical Dungeoneering &amp; Aerial Kinetics
                    </h3>
                  </div>
                  <span className="kodex-font-mono text-xs font-bold bg-[#fcf0f0] text-[#7f1d1d] border border-[#8b1e1e] px-3 py-1">
                    TARGET: 1,000 POINTS // CREATED BY PROF. YVCTUS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs kodex-font-cinzel">
                  {/* Curricular Gym vs Extracurricular Zyng! */}
                  <div className="p-3.5 bg-[#fcf0f0] border border-[#8b1e1e] space-y-2">
                    <div className="kodex-font-mono font-bold text-[#7f1d1d] uppercase text-xs">
                      Curricular Gym vs. Extracurricular Zyng!
                    </div>
                    <p className="text-[#222222] leading-relaxed">
                      K.A.M.P. enforces an absolute division between martial physical education ("Gym") and the sport of <strong>Zyng!</strong>:
                    </p>
                    <ul className="space-y-1 list-disc pl-4 text-[#333333]">
                      <li>
                        <strong>Curricular Gym (GRY-101 / GRY-220):</strong> Graded, lethal/non-lethal battlefield tactics, shield-wall phalanxes, and cavalry maneuvers.
                      </li>
                      <li>
                        <strong>Extracurricular Zyng! (EXT-101 / EXT-210):</strong> Competitive esport held during afternoon free blocks (14:00–18:30) in the Grand Arena. Requires completion of EXT-101 wingsuit and magnetic anchor certification.
                      </li>
                    </ul>
                  </div>

                  {/* Grand Arena Architecture */}
                  <div className="p-3.5 bg-[#f5f5f0] border border-[#111111] space-y-2">
                    <div className="kodex-font-mono font-bold text-[#111111] uppercase text-xs">
                      The Grand Arena &amp; The Silver Rail
                    </div>
                    <p className="text-[#222222] leading-relaxed">
                      The Grand Arena (650×520 ft) features dynamic <strong>Silt-Silk hexagonal flooring</strong> that rises and reconfigures into 3D geometric terrain, anchored by a vertical kinetic rail known as the <strong>Silver Rail</strong>.
                    </p>
                    <p className="text-[#4a4a4a] italic">
                      "Two 9-player Companies compete to maneuver a charged kinetic energy ring (the Zyng) along the Silver Rail while clearing subterranean monster gauntlets."
                    </p>
                  </div>
                </div>

                {/* 9-Player Company Tactical Breakdown */}
                <div className="p-4 bg-[#fafaf7] border-2 border-[#111111] rounded-lg space-y-2.5">
                  <div className="kodex-font-title text-sm font-bold text-[#7f1d1d] uppercase border-b border-stone-300 pb-1">
                    The 9-Player Company Tactical Roster
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs kodex-font-mono">
                    <div className="p-2.5 bg-[#fcf0f0] border border-[#8b1e1e]">
                      <div className="font-bold text-[#7f1d1d] uppercase mb-1">
                        The Upper Arena Team (5 Players):
                      </div>
                      <ul className="space-y-1 text-[#333333]">
                        <li>• <strong>1 Bastion:</strong> Heavy zone defender locking down key hex nodes.</li>
                        <li>• <strong>2 Slingers:</strong> High-mobility aerial rail scorers in wingsuits.</li>
                        <li>• <strong>2 Shapers:</strong> Terrain manipulators shifting the hex-floor via resonant anklets.</li>
                      </ul>
                    </div>

                    <div className="p-2.5 bg-[#f5f5f0] border border-[#111111]">
                      <div className="font-bold text-[#111111] uppercase mb-1">
                        The Subterranean Dungeon Party (4 Players):
                      </div>
                      <ul className="space-y-1 text-[#333333]">
                        <li>• <strong>1 Vanguard:</strong> Frontline tank clearing underground monsters.</li>
                        <li>• <strong>1 Cipher:</strong> Trap specialist and dynamic rune disabler.</li>
                        <li>• <strong>1 Aegis:</strong> Healer, defensive buffer, and restorative channel.</li>
                        <li>• <strong>1 Conduit:</strong> Arcane battery charging arena power gates.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graduation Pathways: Masquerade Auditions vs Adventuring Guild Commission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs kodex-font-cinzel">
                <div className="bg-[#fafaf7] border-2 border-[#111111] rounded-xl p-4 shadow-[3px_3px_0px_#111111] space-y-1.5">
                  <div className="flex items-center justify-between border-b border-stone-300 pb-1">
                    <span className="kodex-font-mono font-bold text-[#7f1d1d] uppercase">
                      GRADUATION PATHWAY I // THE MASQUERADE AUDITIONS
                    </span>
                    <span className="kodex-font-mono text-[10px] bg-[#7f1d1d] text-white px-2 py-0.5">
                      CELESTE DOCKING
                    </span>
                  </div>
                  <p className="text-[#222222] leading-relaxed">
                    Annually, the traveling sovereign capital of Celeste docks directly above the Black Tower. Fifth-term seniors present their capstone artifacts, mass illusions, or tactical martial prowess during the <strong>Masquerade Open Auditions</strong> to compete for elite corporate sponsorships and noble patronage.
                  </p>
                </div>

                <div className="bg-[#fcf0f0] border-2 border-[#8b1e1e] rounded-xl p-4 shadow-[3px_3px_0px_#8b1e1e] space-y-1.5">
                  <div className="flex items-center justify-between border-b border-[#8b1e1e]/40 pb-1">
                    <span className="kodex-font-mono font-bold text-[#7f1d1d] uppercase">
                      GRADUATION PATHWAY II // ADVENTURING GUILD COMMISSION
                    </span>
                    <span className="kodex-font-mono text-[10px] bg-[#111111] text-[#f5f5f0] px-2 py-0.5">
                      FRONTIER EXPEDITION
                    </span>
                  </div>
                  <p className="text-[#222222] leading-relaxed">
                    Cadets seeking active field deployment receive certified <strong>Guild Officer Charters</strong>, authorizing them to lead certified adventuring companies, explore uncharted planar anomalies, and establish frontier redoubts along Konran's outer borders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Utility Strip */}
          <footer
            className="mt-6 pt-4 border-t-2 border-[#111111] flex flex-wrap items-center justify-between gap-4"
            data-purpose="kodex-utility-strip"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  setIsCompactSlate((prev) => !prev);
                }}
                className="px-3 py-1.5 eink-btn kodex-font-cinzel text-xs font-bold cursor-pointer hover:border-[#8b1e1e] hover:text-[#8b1e1e]"
              >
                {isCompactSlate ? 'Expanded Slate' : 'Compact Slate'}
              </button>
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  setShowLibraryNotice((prev) => !prev);
                }}
                className="px-3 py-1.5 eink-btn kodex-font-cinzel text-xs font-bold cursor-pointer hover:border-[#8b1e1e] hover:text-[#8b1e1e]"
              >
                Tower Library Archives
              </button>
              <button
                type="button"
                onClick={() => {
                  playOptionSelect();
                  setShowSortingQuiz(true);
                }}
                className="px-3 py-1.5 bg-[#fcf0f0] border-2 border-[#8b1e1e] text-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white kodex-font-cinzel text-xs font-bold cursor-pointer transition-colors"
              >
                {activeCharacter?.hasCompletedKAMPTrial
                  ? 'Retake K.A.M.P. Sorting Evaluation'
                  : 'Take K.A.M.P. Sorting Quiz'}
              </button>
            </div>
            <div className="text-[11px] kodex-font-mono text-[#4a4a4a] hidden md:block">
              ACADEMIC DEGREE PROGRESS:{' '}
              <span className="text-[#7f1d1d] font-bold">
                {totalEnrolledCredits} / 30 CREDITS ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div>
              <button
                type="button"
                onClick={handleCommitSchedule}
                className="px-5 py-2 bg-[#7f1d1d] hover:bg-[#450a0a] text-[#fef2f2] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] kodex-font-cinzel text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#fef2f2]" />
                Commit Term Schedule
              </button>
            </div>
          </footer>
        </div>

        {/* Signet Stone Bay Hardware */}
        <div
          className="absolute -bottom-8 -left-4 sm:-left-6 z-40 hidden sm:flex items-center"
          data-purpose="signet-stone-bay"
        >
          <div className="bg-[#1b1c1d] p-3 rounded-2xl border-2 border-[#383838] shadow-xl flex items-center gap-3">
            <button
              type="button"
              onClick={handleReSanctify}
              className={`w-14 h-14 bg-[#450a0a] rounded-xl border-2 border-[#d4af37] relative flex items-center justify-center cursor-pointer shadow-none group transition-transform overflow-hidden ${
                sanctifiedPulse ? 'scale-95 ring-2 ring-red-500' : ''
              }`}
              title="Press Crimson Signet Stone to Re-Sanctify Blood-Bound Seal"
            >
              <img
                src="/assets/konran/kamp/signet_stone.png"
                alt="The Signet Stone"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7f1d1d]/60 via-transparent to-[#ef4444]/30 pointer-events-none" />
              <div className="absolute -top-8 left-0 hidden group-hover:block bg-black text-[#f5f5f0] text-[10px] kodex-font-mono px-2 py-0.5 border border-[#8b1e1e] whitespace-nowrap shadow-md">
                PRESS SIGNET STONE TO RE-SANCTIFY
              </div>
            </button>
            <div className="kodex-font-mono text-[10px] leading-tight pr-2">
              <div className="text-[#f5f5f0] font-bold tracking-wider">THE SIGNET STONE</div>
              <div className="text-[#f87171] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                BLOOD-BOUND SEAL
              </div>
              <div className="text-[#888888] text-[9px]">CRIMSON VITRIOL ACTIVE</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#111] border border-[#444] flex items-center justify-center p-0.5">
              <div className="w-full h-full rounded-full bg-[#ebebe6] flex items-center justify-center relative">
                <div className="w-2.5 h-0.5 bg-[#7f1d1d] origin-left -rotate-45" />
                <div className="w-1 h-1 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
