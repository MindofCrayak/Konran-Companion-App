export interface Deity {
  id: string;
  name: string;
  title: string;
  alignment: string;
  domains: string;
  desc: string;
  color: string;
  fontClass: string;
  imgBW: string;
  factions: string[];
  realm: string;
  divineBoon: {
    name: string;
    description: string;
    dndMechanic: string;
  };
  quote: string;
}

export interface QuestionOption {
  text: string;
  deities: string[]; // [primary, secondary] or [primary]
}

export interface Question {
  id: number;
  title: string;
  category?: string;
  options: QuestionOption[];
}

export interface QuizScores {
  [deityId: string]: number;
}

export interface PartyCharacterResult {
  id: string;
  date: string;
  playerName: string;
  characterName: string;
  primaryDeity: string;
  secondaryDeity: string;
  scores: QuizScores;
}

// ==========================================
// KONRA MAGITECH D&D 5.5 EXPANDED SCHEMAS
// ==========================================

export type NyneDeityId = 
  | 'Lyricia' 
  | 'Oray' 
  | 'Ousava' 
  | 'Ay' 
  | 'Kayzoku' 
  | 'Celeste' 
  | 'Psyon' 
  | 'Krayvuk' 
  | 'Slavyna';

export type KAMPHouseId = 
  | 'Aethelgard' 
  | 'Pyros' 
  | 'Thalassa' 
  | 'Astralis' 
  | 'Bellona' 
  | 'Umbra' 
  | 'Paradox' 
  | 'Duath';

export type ClassificationLevel = 
  | 'PUBLIC' 
  | 'RESTRICTED' 
  | 'CLASSIFIED' 
  | 'EYES_ONLY' 
  | 'TOP_SECRET';

export type ActionEconomy = 
  | 'passive' 
  | 'bonus_action' 
  | 'reaction' 
  | 'action' 
  | 'special';

export type RestRecharge = 
  | 'at_will' 
  | 'short_rest' 
  | 'long_rest' 
  | 'dawn';

export interface MechanicalBoon {
  id: string;
  name: string;
  sourceType: 'deity_patron' | 'kamp_house' | 'faction' | 'magitech_implant';
  sourceName: string;
  description: string;
  dndMechanic: string;
  actionType: ActionEconomy;
  usesMax?: number;
  usesRemaining?: number;
  recharge: RestRecharge;
}

export interface KAMPAcademicProfile {
  attended: boolean;
  houseId?: KAMPHouseId;
  houseName?: string;
  yearOfStudy: 'First-Year' | 'Sophomore' | 'Junior' | 'Senior' | 'Alumnus' | 'Expelled';
  majorDiscipline: string;
  academicStanding: 'Distinguished Magus' | 'Honor Roll' | 'Good Standing' | 'Probationary' | 'Blacklisted';
  dormitory: string;
  houseBoon?: MechanicalBoon;
}

export interface FactionAffiliation {
  factionId: string;
  factionName: string;
  deitySponsor?: NyneDeityId;
  rankTier: number; // 1 to 5
  rankTitle: string;
  reputationScore: number;
  clearanceLevel: 'unclassified' | 'restricted' | 'classified' | 'eyes_only' | 'omniscient';
  unlockedBoons: MechanicalBoon[];
  joinedDate: string;
}

export interface CharacterProfile {
  id: string;
  accountId: string;
  name: string;
  title?: string;
  characterClass: string;
  subclass?: string;
  level: number;
  species: string;
  dndAlignment: 'LG' | 'LN' | 'NG' | 'TN' | 'CN' | 'CG' | 'CE' | 'NE' | 'LE';
  
  // Core Pantheon Allegiance
  declaredDeity?: NyneDeityId;
  deityDevotionTier: number; // 0=Undeclared, 1=Pilgrim, 2=Adherent, 3=Disciple, 4=High Templar, 5=Chosen Avatar
  deityBoon?: MechanicalBoon;
  
  // Academic & Faction Standing
  kampProfile: KAMPAcademicProfile;
  factions: FactionAffiliation[];
  
  // Alignment & Academy Trials Status
  hasCompletedDeityTrial: boolean;
  hasCompletedKAMPTrial: boolean;
  quizScores?: QuizScores;
  
  // Faction & Providence Standings (-3 to +3)
  reputation: Record<string, number>;
  endorsements: Array<{ id: string; name: string; issuer: string; dateEarned: string; icon: string }>;

  // Magitech Dossier & Chronicler Notes
  playerNotes: Record<string, string>; // keyed by deityId, factionId, or 'general'
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReputationEntity {
  id: string;
  name: string;
  category: 'providence' | 'church' | 'syndicate' | 'law_enforcement';
  description: string;
  currentTier: number; // -3 (Blacklisted) to +3 (Revered)
  perk: string;
}

export interface PlayerAccount {
  id: string;
  displayName: string;
  handle: string;
  activeCharacterId: string | null;
  characterIds: string[];
  role: 'player' | 'dungeon_master' | 'archivist';
  settings: {
    audioEnabled: boolean;
    crtFlicker: boolean;
    highContrast: boolean;
  };
}

export interface ClearanceRequirement {
  requiredDeity?: NyneDeityId;
  minimumDevotionTier?: number;
  requiredFactionId?: string;
  minimumFactionTier?: number;
  requiredKAMPHouse?: KAMPHouseId;
  requiredRole?: 'player' | 'dungeon_master' | 'archivist';
  requiresAll?: boolean; // false: any match permits access; true: all required
}

export type LoreVisibilityMode = 'redacted' | 'cloaked';

export interface GatedLoreBlock {
  id: string;
  subjectId: string;
  classification: ClassificationLevel;
  requirement: ClearanceRequirement;
  visibilityMode?: LoreVisibilityMode; // defaults to 'cloaked'
  redactedSummary: string;
  unredactedContent: string;
  classificationReason: string;
  loreCategory: 'divine_history' | 'clandestine_conspiracy' | 'assassination_ledger' | 'artifact_schematic';
}

export interface ClearanceEvaluationResult {
  hasAccess: boolean;
  reason: string;
  missingRequirements: string[];
  isCloaked?: boolean;
}

