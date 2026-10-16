import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CharacterProfile, 
  PlayerAccount, 
  NyneDeityId, 
  KAMPHouseId,
  ClearanceRequirement, 
  ClearanceEvaluationResult,
  MechanicalBoon,
  FactionAffiliation,
  QuizScores
} from '../types';
import { DEITIES } from '../data/deities';

// Local storage keys
const STORAGE_KEY_ACCOUNT = 'konra_player_account_v1';
const STORAGE_KEY_CHARACTERS = 'konra_character_roster_v1';

// Seed default player account
const DEFAULT_ACCOUNT: PlayerAccount = {
  id: 'usr_konra_prime_01',
  displayName: 'Archivist Thorne',
  handle: '@chronos_scribe',
  activeCharacterId: 'char_oray_invoker_01',
  characterIds: ['char_oray_invoker_01', 'char_umbra_spy_02'],
  role: 'player',
  settings: {
    audioEnabled: true,
    crtFlicker: true,
    highContrast: false,
  },
};

// Seed sample characters for immediate magitech testing
const SEED_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char_oray_invoker_01',
    accountId: 'usr_konra_prime_01',
    name: 'Valerius Drake',
    title: 'Arcanist of the Caldera',
    characterClass: 'Wizard (Order of Scribes / 5.5e Evoker)',
    subclass: 'Caldera Pyromancy',
    level: 7,
    species: 'Human (Earth Survivor Bloodline)',
    dndAlignment: 'LN',
    declaredDeity: 'Oray',
    deityDevotionTier: 3, // Disciple
    deityBoon: {
      id: 'boon_oray_wyrmfire',
      name: 'Wyrmfire Resonance',
      sourceType: 'deity_patron',
      sourceName: 'Oray, The Dragonlord',
      description: 'Oray channelizes raw arcane ley currents through your soul, attuning you to dragons and volatile spellwork.',
      dndMechanic: 'Once per long rest, when you cast a spell or make a saving throw against magic, you can reroll a damage die or roll a d6 bonus to the save.',
      actionType: 'reaction',
      usesMax: 1,
      usesRemaining: 1,
      recharge: 'long_rest',
    },
    kampProfile: {
      attended: true,
      houseId: 'Pyros',
      houseName: 'House Pyros (Wyrmfire & Alteration)',
      yearOfStudy: 'Senior',
      majorDiscipline: 'High Magitech & Arcane Transmutation',
      academicStanding: 'Distinguished Magus',
      dormitory: 'Obsidian Hearth - Tier 4',
      houseBoon: {
        id: 'boon_kamp_pyros_overcharge',
        name: 'Pyros Arcane Thermal Surge',
        sourceType: 'kamp_house',
        sourceName: 'K.A.M.P. House Pyros',
        description: 'Channel K.A.M.P. condenser coils to superheat an arcane cantrip or spell.',
        dndMechanic: 'Bonus Action: Until the end of your turn, your fire and force spell damage ignores resistance.',
        actionType: 'bonus_action',
        usesMax: 2,
        usesRemaining: 2,
        recharge: 'short_rest',
      },
    },
    factions: [
      {
        factionId: 'practitioners_of_magic',
        factionName: 'Practitioners of Magic',
        deitySponsor: 'Oray',
        rankTier: 3,
        rankTitle: 'Ley-Warden (Officer)',
        reputationScore: 420,
        clearanceLevel: 'classified',
        unlockedBoons: [
          {
            id: 'boon_pom_ley_weave',
            name: 'Ley-Line Siphon',
            sourceType: 'faction',
            sourceName: 'Practitioners of Magic',
            description: 'Absorb stray planar energy from counterspelled or resisted magical surges.',
            dndMechanic: 'Reaction: Regain a level 1 spell slot when an enemy spell fails within 30 ft.',
            actionType: 'reaction',
            usesMax: 1,
            usesRemaining: 1,
            recharge: 'long_rest',
          },
        ],
        joinedDate: '2026-03-12',
      },
    ],
    quizScores: {
      Oray: 18,
      Lyricia: 12,
      Celeste: 8,
      Ousava: 6,
      Ay: 4,
      Kayzoku: 2,
      Krayvuk: 1,
      Slavyna: 0,
      Psyon: 0,
    },
    hasCompletedDeityTrial: true,
    hasCompletedKAMPTrial: true,
    reputation: {
      prov_caldera: 2,
      church_wyrmheart: 2,
      synd_spyder: -1,
      law_justiciars: 1,
    },
    endorsements: [
      {
        id: 'end_01',
        name: 'Order of Scribes Commendation',
        issuer: 'High Magus of Pyros',
        dateEarned: '2026-05-14',
        icon: 'Sparkles',
      },
    ],
    playerNotes: {
      general: 'Investigating anomalous fractures in the steam labs of Southern Konran. Keep leylines stable.',
      Oray: 'Must consult Wyrmfire rituals before descending into the Caldera core.',
    },
    notes: 'Investigating anomalous fractures in the steam labs of Southern Konran.',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'char_umbra_spy_02',
    accountId: 'usr_konra_prime_01',
    name: 'Sylvi of the Veil',
    title: 'Shadow Whisperer',
    characterClass: 'Rogue (5.5e Assassin / Soulknife)',
    subclass: 'Infiltrator of Synthelavor',
    level: 6,
    species: 'Shadow Elf',
    dndAlignment: 'LE',
    declaredDeity: 'Slavyna',
    deityDevotionTier: 2, // Adherent
    deityBoon: {
      id: 'boon_slavyna_leverage',
      name: 'Vicious Leverage',
      sourceType: 'deity_patron',
      sourceName: 'Slavyna, The Dark Mother',
      description: 'Slavyna whispers dark secrets and sovereign dominance into your ear, granting unmatched social and tactical leverage.',
      dndMechanic: 'You gain proficiency in Deception or Stealth. When striking an unsuspecting creature or successfully deceiving a foe, add 1d10 necrotic damage.',
      actionType: 'passive',
      recharge: 'at_will',
    },
    kampProfile: {
      attended: true,
      houseId: 'Umbra',
      houseName: 'House Umbra (Subterfuge & Shadow Alchemy)',
      yearOfStudy: 'Alumnus',
      majorDiscipline: 'Covert Diplomatic Espionage & Cryptography',
      academicStanding: 'Honor Roll',
      dormitory: 'The Cloaked Quarters',
      houseBoon: {
        id: 'boon_kamp_umbra_veil',
        name: 'Umbral Blindspot Infiltration',
        sourceType: 'kamp_house',
        sourceName: 'K.A.M.P. House Umbra',
        description: 'Slip into visual dead-zones using light-bending micro-enchantments.',
        dndMechanic: 'Bonus Action: Become invisible until the start of your next turn or until you make an attack or cast a spell.',
        actionType: 'bonus_action',
        usesMax: 1,
        usesRemaining: 1,
        recharge: 'short_rest',
      },
    },
    factions: [
      {
        factionId: 'spyder_systerhood',
        factionName: 'Spyder Systerhood',
        deitySponsor: 'Slavyna',
        rankTier: 2,
        rankTitle: 'Weaver of Whispers (Operative)',
        reputationScore: 280,
        clearanceLevel: 'restricted',
        unlockedBoons: [],
        joinedDate: '2026-05-18',
      },
    ],
    quizScores: {
      Slavyna: 19,
      Psyon: 10,
      Kayzoku: 9,
      Krayvuk: 8,
      Ay: 5,
      Celeste: 2,
      Ousava: 0,
      Oray: 0,
      Lyricia: 0,
    },
    hasCompletedDeityTrial: true,
    hasCompletedKAMPTrial: true,
    reputation: {
      synd_spyder: 3,
      church_silent_loom: 2,
      law_justiciars: -2,
      prov_caldera: -1,
    },
    endorsements: [
      {
        id: 'end_02',
        name: 'Synthelavor Phantom Mark',
        issuer: 'Spyder Systerhood Inner Circle',
        dateEarned: '2026-08-20',
        icon: 'Shield',
      },
    ],
    playerNotes: {
      general: 'Operating behind merchant facades in Vantya to monitor Lyricia’s audit squads. Watch the back alley.',
      Slavyna: 'The Dark Mother requires leverage on the Arch-Justiciar before the equinox.',
    },
    notes: 'Operating behind merchant facades in Vantya to monitor Lyricia’s audit squads.',
    createdAt: '2026-05-18T14:30:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
];

interface CharacterContextType {
  account: PlayerAccount;
  characters: CharacterProfile[];
  activeCharacter: CharacterProfile | null;
  setActiveCharacterId: (id: string | null) => void;
  createCharacter: (profile: Omit<CharacterProfile, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>) => CharacterProfile;
  updateCharacter: (id: string, updates: Partial<CharacterProfile>) => void;
  deleteCharacter: (id: string) => void;
  declareDeity: (characterId: string, deityId?: NyneDeityId | null, devotionTier?: number) => boolean;
  updateKAMPAcademics: (characterId: string, kamp: Partial<CharacterProfile['kampProfile']>) => void;
  joinFaction: (characterId: string, faction: FactionAffiliation) => void;
  updateFactionStanding: (characterId: string, factionId: string, newTier: number, newRep: number) => void;
  evaluateClearance: (requirement: ClearanceRequirement) => ClearanceEvaluationResult;
  recordDeityTrial: (characterId: string, scores: QuizScores, primaryDeity?: NyneDeityId) => void;
  resetDeityTrial: (characterId: string) => void;
  setPlayerNote: (characterId: string, key: string, content: string) => void;
  setReputationScore: (characterId: string, entityId: string, score: number) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted player account or initialize default
  const [account, setAccount] = useState<PlayerAccount>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACCOUNT);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return DEFAULT_ACCOUNT;
  });

  // Load persisted characters roster or seed, ensuring schema normalization
  const [characters, setCharacters] = useState<CharacterProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHARACTERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            ...c,
            hasCompletedDeityTrial: c.hasCompletedDeityTrial ?? (c.quizScores ? true : false),
            hasCompletedKAMPTrial: c.hasCompletedKAMPTrial ?? (c.kampProfile?.attended ? true : false),
            reputation: c.reputation ?? {},
            endorsements: c.endorsements ?? [],
            playerNotes: c.playerNotes ?? {},
          }));
        }
      }
    } catch {
      // Ignore
    }
    return SEED_CHARACTERS;
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(account));
    } catch (e) {
      console.warn('Could not write account to localStorage', e);
    }
  }, [account]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(characters));
    } catch (e) {
      console.warn('Could not write characters to localStorage', e);
    }
  }, [characters]);

  // Derived active character entity
  const activeCharacter = useMemo(() => {
    if (!account.activeCharacterId) return null;
    return characters.find(c => c.id === account.activeCharacterId) || null;
  }, [characters, account.activeCharacterId]);

  // Set designated active character
  const setActiveCharacterId = useCallback((id: string | null) => {
    setAccount(prev => ({
      ...prev,
      activeCharacterId: id,
    }));
  }, []);

  // Create new character
  const createCharacter = useCallback((
    profile: Omit<CharacterProfile, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>
  ): CharacterProfile => {
    const newId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const newChar: CharacterProfile = {
      ...profile,
      hasCompletedDeityTrial: profile.hasCompletedDeityTrial ?? false,
      hasCompletedKAMPTrial: profile.hasCompletedKAMPTrial ?? false,
      reputation: profile.reputation || {},
      endorsements: profile.endorsements || [],
      playerNotes: profile.playerNotes || {},
      id: newId,
      accountId: account.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setCharacters(prev => [newChar, ...prev]);
    setAccount(prev => ({
      ...prev,
      characterIds: [...prev.characterIds, newId],
      activeCharacterId: newId, // designate new character by default
    }));

    return newChar;
  }, [account.id]);

  // Update existing character
  const updateCharacter = useCallback((id: string, updates: Partial<CharacterProfile>) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== id) return char;
        return {
          ...char,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Delete character
  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    setAccount(prev => {
      const remaining = prev.characterIds.filter(cid => cid !== id);
      const nextActive = prev.activeCharacterId === id 
        ? (remaining.length > 0 ? remaining[0] : null) 
        : prev.activeCharacterId;
      return {
        ...prev,
        characterIds: remaining,
        activeCharacterId: nextActive,
      };
    });
  }, []);

  // Declare Patron Deity & bind 5.5e Mechanical Boon (guarded by Divine Covenant Immutability)
  const declareDeity = useCallback((characterId: string, deityId?: NyneDeityId | null, devotionTier: number = 1): boolean => {
    const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
    const targetChar = characters.find(c => c.id === characterId);

    if (!targetChar) return false;

    // Divine Covenant Immutability:
    // If a deity is already bound and the active user is not a DM/Archivist, deny alteration.
    if (targetChar.declaredDeity && !isDM) {
      console.warn(`[Covenant Immutability]: Unauthorized deity alteration attempt on character ${characterId}. DM authority required.`);
      return false;
    }

    // Dissolve Covenant (DM only if already bound)
    if (!deityId) {
      if (targetChar.declaredDeity && !isDM) return false;
      updateCharacter(characterId, {
        declaredDeity: undefined,
        deityDevotionTier: 0,
        deityBoon: undefined,
      });
      return true;
    }

    const deityMeta = DEITIES[deityId];
    let boon: MechanicalBoon | undefined = undefined;

    if (deityMeta && deityMeta.divineBoon) {
      boon = {
        id: `boon_deity_${deityId.toLowerCase()}`,
        name: deityMeta.divineBoon.name,
        sourceType: 'deity_patron',
        sourceName: `${deityMeta.name} (${deityMeta.title})`,
        description: deityMeta.divineBoon.description,
        dndMechanic: deityMeta.divineBoon.dndMechanic,
        actionType: 'special',
        recharge: 'long_rest',
      };
    }

    updateCharacter(characterId, {
      declaredDeity: deityId,
      deityDevotionTier: devotionTier,
      deityBoon: boon,
    });
    return true;
  }, [account.role, characters, updateCharacter]);

  // Update K.A.M.P. prep academy profile
  const updateKAMPAcademics = useCallback((characterId: string, kampUpdates: Partial<CharacterProfile['kampProfile']>) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        return {
          ...char,
          kampProfile: {
            ...char.kampProfile,
            ...kampUpdates,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Join Faction
  const joinFaction = useCallback((characterId: string, faction: FactionAffiliation) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        const exists = char.factions.some(f => f.factionId === faction.factionId);
        const updatedFactions = exists
          ? char.factions.map(f => f.factionId === faction.factionId ? faction : f)
          : [...char.factions, faction];
        return {
          ...char,
          factions: updatedFactions,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Update Faction Standing
  const updateFactionStanding = useCallback((characterId: string, factionId: string, newTier: number, newRep: number) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        const updatedFactions = char.factions.map(f => {
          if (f.factionId !== factionId) return f;
          return {
            ...f,
            rankTier: newTier,
            reputationScore: newRep,
          };
        });
        return {
          ...char,
          factions: updatedFactions,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Record Deity Alignment Trial completion
  const recordDeityTrial = useCallback((characterId: string, scores: QuizScores, primaryDeity?: NyneDeityId) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        const shouldBind = !char.declaredDeity && primaryDeity;
        let newBoon = char.deityBoon;
        if (shouldBind && primaryDeity && DEITIES[primaryDeity]?.divineBoon) {
          const meta = DEITIES[primaryDeity];
          newBoon = {
            id: `boon_deity_${primaryDeity.toLowerCase()}`,
            name: meta.divineBoon!.name,
            sourceType: 'deity_patron',
            sourceName: `${meta.name} (${meta.title})`,
            description: meta.divineBoon!.description,
            dndMechanic: meta.divineBoon!.dndMechanic,
            actionType: 'special',
            recharge: 'long_rest',
          };
        }
        return {
          ...char,
          hasCompletedDeityTrial: true,
          quizScores: scores,
          declaredDeity: shouldBind ? primaryDeity : char.declaredDeity,
          deityDevotionTier: shouldBind ? 1 : char.deityDevotionTier,
          deityBoon: newBoon,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Reset Deity Trial record (DM override authority only)
  const resetDeityTrial = useCallback((characterId: string) => {
    const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
    if (!isDM) {
      console.warn('[Trial Security]: DM authority required to reset trial records.');
      return;
    }
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        return {
          ...char,
          hasCompletedDeityTrial: false,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [account.role]);

  // Set Player / Chronicler Note (keyed by deityId, factionId, or 'general')
  const setPlayerNote = useCallback((characterId: string, key: string, content: string) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        return {
          ...char,
          playerNotes: {
            ...char.playerNotes,
            [key]: content,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Set Reputation Score (-3 to +3) across Konran entities (DM authority only)
  const setReputationScore = useCallback((characterId: string, entityId: string, score: number) => {
    const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
    if (!isDM) {
      console.warn('[Reputation Authority]: Only DM/Archivist can calibrate standing scores.');
      return;
    }
    const clamped = Math.max(-3, Math.min(3, score));
    setCharacters(prev =>
      prev.map(char => {
        if (char.id !== characterId) return char;
        return {
          ...char,
          reputation: {
            ...char.reputation,
            [entityId]: clamped,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [account.role]);

  /**
   * Clearance Evaluator Engine
   * Evaluates if the active character has clearance to view classified/redacted lore.
   * If Dungeon Master / Archivist role is active on the account, master bypass applies.
   */
  const evaluateClearance = useCallback((requirement: ClearanceRequirement): ClearanceEvaluationResult => {
    // 1. Role Bypass for DMs & Archivists
    if (account.role === 'dungeon_master' || account.role === 'archivist') {
      return {
        hasAccess: true,
        reason: `Master Clearance Granted via [${account.role.toUpperCase()}] authority.`,
        missingRequirements: [],
      };
    }

    // 2. Active Character Check
    if (!activeCharacter) {
      return {
        hasAccess: false,
        reason: 'Access Denied: No active character designated in player profile.',
        missingRequirements: ['Active Character Profile required'],
      };
    }

    const checks: { met: boolean; label: string }[] = [];

    // Check Deity Allegiance & Devotion Tier
    if (requirement.requiredDeity) {
      const isFollower = activeCharacter.declaredDeity === requirement.requiredDeity;
      const minTier = requirement.minimumDevotionTier ?? 1;
      const tierMet = (activeCharacter.deityDevotionTier ?? 0) >= minTier;
      const pass = isFollower && tierMet;
      checks.push({
        met: pass,
        label: `Declared Follower of ${requirement.requiredDeity} (Min Tier ${minTier})`,
      });
    }

    // Check Faction Affiliation & Tier
    if (requirement.requiredFactionId) {
      const faction = activeCharacter.factions.find(f => f.factionId === requirement.requiredFactionId);
      const minTier = requirement.minimumFactionTier ?? 1;
      const pass = !!faction && faction.rankTier >= minTier;
      checks.push({
        met: pass,
        label: `Affiliated with ${requirement.requiredFactionId} (Min Rank Tier ${minTier})`,
      });
    }

    // Check K.A.M.P. House
    if (requirement.requiredKAMPHouse) {
      const houseMatch = activeCharacter.kampProfile.attended && activeCharacter.kampProfile.houseId === requirement.requiredKAMPHouse;
      checks.push({
        met: houseMatch,
        label: `K.A.M.P. House Enrollment: ${requirement.requiredKAMPHouse}`,
      });
    }

    // Check Account Role constraint if specified in requirement
    if (requirement.requiredRole) {
      const roleMatch = account.role === requirement.requiredRole;
      checks.push({
        met: roleMatch,
        label: `Account Role: ${requirement.requiredRole}`,
      });
    }

    if (checks.length === 0) {
      return {
        hasAccess: true,
        reason: 'Public clearance level - unclassified document.',
        missingRequirements: [],
      };
    }

    const requiresAll = requirement.requiresAll ?? false;
    const hasAccess = requiresAll
      ? checks.every(c => c.met)
      : checks.some(c => c.met);

    const missing = checks.filter(c => !c.met).map(c => c.label);

    return {
      hasAccess,
      reason: hasAccess 
        ? 'Clearance Verified. Decryption cipher aligned.' 
        : `Security Lockout: Missing required security credentials.`,
      missingRequirements: missing,
      isCloaked: !hasAccess,
    };
  }, [account.role, activeCharacter]);

  const value = useMemo(() => ({
    account,
    characters,
    activeCharacter,
    setActiveCharacterId,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    declareDeity,
    updateKAMPAcademics,
    joinFaction,
    updateFactionStanding,
    evaluateClearance,
    recordDeityTrial,
    resetDeityTrial,
    setPlayerNote,
    setReputationScore,
  }), [
    account,
    characters,
    activeCharacter,
    setActiveCharacterId,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    declareDeity,
    updateKAMPAcademics,
    joinFaction,
    updateFactionStanding,
    evaluateClearance,
    recordDeityTrial,
    resetDeityTrial,
    setPlayerNote,
    setReputationScore,
  ]);

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
