export interface PrestigeOrClassProgress {
  name: string;
  level: number;
  hitDie: 6 | 8 | 10 | 12;
  featuresText: string;
}

export interface CharacterExportPayload {
  name: string;
  raceName: string;
  raceFeaturesText: string;
  backgroundName: string;
  backgroundFeaturesText: string;
  classes: PrestigeOrClassProgress[];
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  savingThrowProficiencies: {
    str: boolean;
    dex: boolean;
    con: boolean;
    int: boolean;
    wis: boolean;
    cha: boolean;
  };
  skillProficiencies?: Record<string, boolean>;
  hp: {
    current: number;
    max: number;
    temp?: number;
  };
  speed: number;
  armorClass: number;
  proficiencies: {
    armor?: string;
    weapons?: string;
    tools?: string;
    languages?: string;
  };
  inventory: string[];
}
