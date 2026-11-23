import { CharacterProfile, CharacterSheetStats, InventoryItem, NyneDeityId } from '../types';
import { DEITY_IDS } from '../data/deities';

export interface CharacterImportResult {
  ok: boolean;
  format?: 'slablet_native' | 'walter_kammerer_5e_xml' | 'dnd_beyond_json' | 'generic_5e_json';
  updates?: Partial<CharacterProfile>;
  summary?: string;
  error?: string;
}

function clampStat(val: unknown, fallback = 10, min = 1, max = 30): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function parseXmlTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

/**
 * Universal Character Importer & Schema Normalizer (Task T-013)
 * Supports:
 * 1. Native Slablet CharacterProfile JSON (& CharacterExportPayload round-trip)
 * 2. Walter Kammerer Fifth Edition Character Sheet XML-in-.json / .xml (`<character>` + `⊠`, `⊡`, `⊟`)
 * 3. D&D Beyond / 5e.tools / Foundry VTT 5e Character JSON
 */
export function parseImportedCharacterFile(rawText: string, fileName = 'character.json'): CharacterImportResult {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    return {
      ok: false,
      error: `Import failed (${fileName}): File is empty (0 bytes). Expected Slablet JSON, 5e JSON, or Walter Kammerer <character> XML.`,
    };
  }

  // 1. Auto-detect Walter Kammerer Fifth Edition Character Sheet XML (often saved with .json extension)
  if (trimmed.startsWith('<?xml') || trimmed.includes('<character>')) {
    if (!trimmed.includes('<character>') || !trimmed.includes('</character>')) {
      return {
        ok: false,
        error: `Import failed (${fileName}): Malformed XML payload — missing root <character>...</character> element.`,
      };
    }

    const abilityRaw = parseXmlTag(trimmed, 'abilityScores');
    const abilityParts = abilityRaw ? abilityRaw.split('⊠') : [];
    if (abilityParts.length < 6) {
      return {
        ok: false,
        error: `Import failed (${fileName}): Walter Kammerer XML field <abilityScores> is missing or has fewer than 6 '⊠'-delimited ability scores.`,
      };
    }

    const noteRaw = parseXmlTag(trimmed, 'noteList');
    const notes = noteRaw ? noteRaw.split('⊠') : [];
    const classDataRaw = parseXmlTag(trimmed, 'classData');
    const firstClassBlock = classDataRaw ? classDataRaw.split('⊟')[0] : '';
    const classParts = firstClassBlock ? firstClassBlock.split('⊡') : [];

    const name = notes[17]?.trim() || 'Imported 5e Adventurer';
    const classFromData = classParts[0]?.trim();
    const levelFromData = parseInt(classParts[2] || '1', 10);
    const classFromNotes = notes[18]?.trim();
    const raceName = notes[19]?.trim() || (classDataRaw.split('⊟')[6] || '').trim() || 'Konran Native';

    const hpCurrent = clampStat(parseXmlTag(trimmed, 'currentHealth'), 12, 0, 999);
    const hpMax = clampStat(parseXmlTag(trimmed, 'maxHealth'), Math.max(10, hpCurrent), 1, 999);
    const tempHp = clampStat(parseXmlTag(trimmed, 'currentTempHP'), 0, 0, 999);
    const ac = clampStat(parseXmlTag(trimmed, 'armorBonus'), 12, 1, 40);
    const speed = clampStat(parseXmlTag(trimmed, 'baseSpeed'), 30, 5, 120);
    const profBonus = clampStat(parseXmlTag(trimmed, 'proficiencyBonus'), 2, 2, 9);

    const stats: CharacterSheetStats = {
      str: clampStat(abilityParts[0], 10),
      dex: clampStat(abilityParts[1], 10),
      con: clampStat(abilityParts[2], 10),
      int: clampStat(abilityParts[3], 10),
      wis: clampStat(abilityParts[4], 10),
      cha: clampStat(abilityParts[5], 10),
      hpCurrent,
      hpMax,
      tempHp,
      ac,
      speed,
      proficiencyBonus: profBonus,
      initiativeBonus: Math.floor((clampStat(abilityParts[1], 10) - 10) / 2),
      goldGp: clampStat(notes[24], 50, 0, 1000000),
      hitDice: `${Number.isFinite(levelFromData) ? levelFromData : 1}d8`,
    };

    const rawInvLines = (notes[5] || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const inventory: InventoryItem[] = rawInvLines.map((line, idx) => ({
      id: `imp_wk_${Date.now()}_${idx}`,
      name: line.replace(/\s*\(x\d+\).*$/i, '').trim() || `Imported Item ${idx + 1}`,
      category: 'Gear',
      quantity: 1,
      description: line,
    }));

    const updates: Partial<CharacterProfile> = {
      name,
      species: raceName,
      characterClass: classFromData || classFromNotes || 'Adventurer',
      level: Number.isFinite(levelFromData) && levelFromData > 0 ? levelFromData : 1,
      stats,
      ...(inventory.length > 0 ? { inventory } : {}),
      ...(notes[0] ? { playerNotes: { general: notes[0] } } : {}),
    };

    return {
      ok: true,
      format: 'walter_kammerer_5e_xml',
      updates,
      summary: `Imported "${updates.name}" (Lv.${updates.level} ${updates.species} ${updates.characterClass}) from Walter Kammerer 5e XML format.`,
    };
  }

  // 2. Parse JSON formats
  let parsed: any;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err: any) {
    return {
      ok: false,
      error: `Import failed (${fileName}): Invalid JSON syntax (${err?.message || 'parse error'}). Upload a valid Slablet .json, D&D Beyond .json, or Walter Kammerer <character> file.`,
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      error: `Import failed (${fileName}): Root JSON value must be an object containing character fields (e.g. "name", "stats" or "abilities").`,
    };
  }

  // Unwrap D&D Beyond wrapper `{ data: { ... } }` or `{ character: { ... } }` if present
  const root = parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)
    ? parsed.data
    : parsed.character && typeof parsed.character === 'object'
    ? parsed.character
    : parsed;

  // Validate required identity or stats fields
  const rawName = root.name || root.characterName || root.title;
  const hasStatsObj = root.stats && typeof root.stats === 'object';
  const hasAbilitiesObj = root.abilities && typeof root.abilities === 'object';
  const hasDdbStatsArray = Array.isArray(root.stats) && root.stats.length >= 6;

  if (!rawName && !hasStatsObj && !hasAbilitiesObj && !hasDdbStatsArray) {
    const foundKeys = Object.keys(root).slice(0, 6).join(', ') || 'none';
    return {
      ok: false,
      error: `Import failed (${fileName}): Missing required fields "name" and "stats"/"abilities". Found keys: [${foundKeys}].`,
    };
  }

  // Extract 6 ability scores across all supported JSON schemas
  let str = 10, dex = 10, con = 10, int = 10, wis = 10, cha = 10;
  if (hasDdbStatsArray) {
    // D&D Beyond array: [{id:1, value:10}, {id:2, value:14}, ...]
    str = clampStat(root.stats[0]?.value ?? root.stats[0], 10);
    dex = clampStat(root.stats[1]?.value ?? root.stats[1], 10);
    con = clampStat(root.stats[2]?.value ?? root.stats[2], 10);
    int = clampStat(root.stats[3]?.value ?? root.stats[3], 10);
    wis = clampStat(root.stats[4]?.value ?? root.stats[4], 10);
    cha = clampStat(root.stats[5]?.value ?? root.stats[5], 10);
  } else {
    const src = root.stats || root.abilities || root.abilityScores || root;
    str = clampStat(src.str?.value ?? src.str ?? src.strength, 10);
    dex = clampStat(src.dex?.value ?? src.dex ?? src.dexterity, 10);
    con = clampStat(src.con?.value ?? src.con ?? src.constitution, 10);
    int = clampStat(src.int?.value ?? src.int ?? src.intelligence, 10);
    wis = clampStat(src.wis?.value ?? src.wis ?? src.wisdom, 10);
    cha = clampStat(src.cha?.value ?? src.cha ?? src.charisma, 10);
  }

  // Extract class & level
  let characterClass = root.characterClass || root.className || 'Adventurer';
  let level = clampStat(root.level, 1, 1, 20);
  if (Array.isArray(root.classes) && root.classes.length > 0) {
    const firstC = root.classes[0];
    characterClass = firstC.name || firstC.definition?.name || characterClass;
    const totalLvl = root.classes.reduce((acc: number, c: any) => acc + (Number(c.level) || 0), 0);
    if (totalLvl > 0) level = clampStat(totalLvl, 1, 1, 20);
  }

  const species =
    root.species ||
    root.raceName ||
    root.race?.fullName ||
    root.race?.baseName ||
    (typeof root.race === 'string' ? root.race : 'Konran Native');

  const hpMax = clampStat(
    root.stats?.hpMax ?? root.hp?.max ?? root.baseHitPoints ?? root.attributes?.hp?.max,
    10 + level * 6,
    1,
    999
  );
  const hpCurrent = clampStat(
    root.stats?.hpCurrent ?? root.hp?.current ?? hpMax,
    hpMax,
    0,
    999
  );
  const tempHp = clampStat(root.stats?.tempHp ?? root.hp?.temp ?? root.temporaryHitPoints, 0, 0, 999);
  const ac = clampStat(root.stats?.ac ?? root.armorClass ?? root.attributes?.ac?.value, 10 + Math.floor((dex - 10) / 2), 1, 40);
  const speed = clampStat(root.stats?.speed ?? root.speed ?? root.race?.weightSpeeds?.normal?.walk, 30, 5, 120);
  const proficiencyBonus = Math.floor((level - 1) / 4) + 2;

  const stats: CharacterSheetStats = {
    str,
    dex,
    con,
    int,
    wis,
    cha,
    hpCurrent,
    hpMax,
    tempHp,
    ac,
    speed,
    proficiencyBonus: clampStat(root.stats?.proficiencyBonus, proficiencyBonus, 2, 9),
    initiativeBonus: clampStat(root.stats?.initiativeBonus, Math.floor((dex - 10) / 2), -5, 20),
    goldGp: clampStat(root.stats?.goldGp ?? root.currencies?.gp, 100, 0, 10000000),
    hitDice: root.stats?.hitDice || `${level}d8`,
  };

  let inventory: InventoryItem[] | undefined;
  if (Array.isArray(root.inventory)) {
    inventory = root.inventory.map((it: any, idx: number) => {
      if (typeof it === 'string') {
        return {
          id: `imp_str_${Date.now()}_${idx}`,
          name: it.replace(/\s*\(x\d+\).*$/i, '').trim() || `Item ${idx + 1}`,
          category: 'Gear',
          quantity: 1,
          description: it,
        };
      }
      return {
        id: it.id || `imp_obj_${Date.now()}_${idx}`,
        name: it.name || it.definition?.name || `Item ${idx + 1}`,
        category: it.category || 'Gear',
        quantity: clampStat(it.quantity, 1, 1, 9999),
        valueGp: Number(it.valueGp) || undefined,
        attuned: Boolean(it.attuned),
        description: it.description || it.definition?.description || '',
      };
    });
  }

  let declaredDeity: NyneDeityId | undefined;
  if (root.declaredDeity && DEITY_IDS.includes(root.declaredDeity as NyneDeityId)) {
    declaredDeity = root.declaredDeity as NyneDeityId;
  }

  const format: CharacterImportResult['format'] =
    root.format === 'konran_slablet_v4' || root.deityDevotionTier !== undefined
      ? 'slablet_native'
      : hasDdbStatsArray
      ? 'dnd_beyond_json'
      : 'generic_5e_json';

  const updates: Partial<CharacterProfile> = {
    name: String(rawName || 'Imported Operative').trim(),
    species: String(species).trim(),
    characterClass: String(characterClass).trim(),
    level,
    stats,
    ...(inventory ? { inventory } : {}),
    ...(declaredDeity ? { declaredDeity } : {}),
    ...(root.playerNotes
      ? {
          playerNotes:
            typeof root.playerNotes === 'object' && root.playerNotes !== null
              ? (root.playerNotes as Record<string, string>)
              : { general: String(root.playerNotes) },
        }
      : {}),
    ...(root.lifepath ? { lifepath: root.lifepath } : {}),
    ...(root.kampProfile ? { kampProfile: root.kampProfile } : {}),
  };

  return {
    ok: true,
    format,
    updates,
    summary: `Imported "${updates.name}" (Lv.${updates.level} ${updates.species} ${updates.characterClass}) [${format.replace(/_/g, ' ').toUpperCase()}].`,
  };
}

export function exportSlabletCharacterJson(character: CharacterProfile): void {
  const payload = {
    format: 'konran_slablet_v4',
    exportedAt: new Date().toISOString(),
    ...character,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (character.name || 'Operative').replace(/[^a-z0-9]/gi, '_');
  a.href = url;
  a.download = `${safeName}_Slablet_v4.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
