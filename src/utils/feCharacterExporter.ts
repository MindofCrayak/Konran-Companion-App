import { CharacterExportPayload } from '../types/feExport';

export function generate5eCharacterXml(data: CharacterExportPayload): string {
  const totalLevel = Math.max(
    1,
    data.classes.reduce((acc, c) => acc + c.level, 0)
  );
  const primaryClass = data.classes[0] || {
    name: 'Adventurer',
    level: 1,
    hitDie: 8,
    featuresText: '',
  };
  const profBonus = Math.floor((totalLevel - 1) / 4) + 2;

  // 1. Build classData chunk (handling multi-class & prestige classes)
  const classLevelsChunk = data.classes
    .map((c) => `${c.name}⊡⊡${c.level}⊡0⊡0`)
    .join('⊟');

  const classData = `${classLevelsChunk}⊟⊟Resource⊡Resource⊡0⊡0⊡0⊡2⊡0⊡0⊡303⊡0⊟⊟⊟⊟⊟${data.raceName}⊟${data.raceName}⊟${data.backgroundName}⊟0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠⊟0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠⊟20⊠20⊠20⊠20⊠20⊠20⊠⊟0⊟2⊟0⊟1⊟1⊟1`;

  // 2. Build abilityScores chunk
  const abilityScores = [
    data.stats.str,
    data.stats.dex,
    data.stats.con,
    data.stats.int,
    data.stats.wis,
    data.stats.cha,
    data.savingThrowProficiencies.str,
    data.savingThrowProficiencies.dex,
    data.savingThrowProficiencies.con,
    data.savingThrowProficiencies.int,
    data.savingThrowProficiencies.wis,
    data.savingThrowProficiencies.cha,
    0, 0, 0, 0, 0, 0, 0,
  ].join('⊠');

  // 3. Compile full text features into noteList Index 0
  const featureBlocks = [
    `${data.raceName} Features:\n${data.raceFeaturesText}`,
    `${data.backgroundName} Features:\n${data.backgroundFeaturesText}`,
    ...data.classes.map((c) => `${c.name} Features:\n${c.featuresText}`),
  ];
  const featuresText = featureBlocks.filter((b) => b.trim().length > 0).join('\n\n');

  // 4. Build noteList array
  const noteListArray = new Array(28).fill('');
  noteListArray[0] = featuresText;
  noteListArray[1] = data.proficiencies.armor || '';
  noteListArray[2] = data.proficiencies.weapons || '';
  noteListArray[3] = data.proficiencies.tools || '';
  noteListArray[4] = data.proficiencies.languages || '';
  noteListArray[5] = data.inventory.join('\n');
  noteListArray[17] = data.name;
  noteListArray[18] = `${primaryClass.name} ${totalLevel}`;
  noteListArray[19] = data.raceName;
  noteListArray[20] = data.backgroundName;
  noteListArray[21] = '0';
  noteListArray[22] = '0';
  noteListArray[23] = '0';
  noteListArray[24] = '10';
  noteListArray[25] = '0';
  noteListArray[26] = '0';

  const noteList = noteListArray.join('⊠');

  // 5. Hit Dice
  const hitDiceList = `${totalLevel}⊠${totalLevel}⊠${primaryClass.hitDie}⊠${totalLevel}`;

  // 6. Return standard XML structure
  return `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
<character>
<version>1</version>
<initMiscMod>0</initMiscMod>
<improvedInitiative>0</improvedInitiative>
<currentHealth>${data.hp.current}</currentHealth>
<maxHealth>${data.hp.max}</maxHealth>
<currentTempHP>${data.hp.temp || 0}</currentTempHP>
<armorBonus>${data.armorClass}</armorBonus>
<shieldBonus>0</shieldBonus>
<miscArmorBonus>0</miscArmorBonus>
<maxDex>10</maxDex>
<proficiencyBonus>${profBonus}</proficiencyBonus>
<miscSpellAttackBonus>0</miscSpellAttackBonus>
<miscSpellDCBonus>0</miscSpellDCBonus>
<castingStatCode>4</castingStatCode>
<offenseAbilityDisplay>0</offenseAbilityDisplay>
<deathSaveSuccesses>0</deathSaveSuccesses>
<deathSaveFailures>0</deathSaveFailures>
<showDeathSaves>true</showDeathSaves>
<baseSpeed>${data.speed}</baseSpeed>
<speedMiscMod>0</speedMiscMod>
<movementMode>Speed</movementMode>
<raceCode>-1</raceCode>
<subraceCode>-1</subraceCode>
<backgroundCode>-1</backgroundCode>
<pagePosition0>1</pagePosition0>
<pagePosition1>2</pagePosition1>
<pagePosition2>3</pagePosition2>
<pagePosition3>4</pagePosition3>
<pagePosition4>5</pagePosition4>
<unarmoredDefense>0</unarmoredDefense>
<featCode></featCode>
<classData>${classData}</classData>
<multiclassFeatures></multiclassFeatures>
<weaponList></weaponList>
<abilityScores>${abilityScores}</abilityScores>
<skillInfo>false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠false⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠0⊠false</skillInfo>
<spellList>v1.1⊠0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡⊠false⊡false⊡false⊡false⊡false⊡false⊡false⊡false⊡false⊡false⊡⊠0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡⊠0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡0⊡⊠0⊠0⊠false⊠⊟</spellList>
<noteList>${noteList}</noteList>
<hitDiceList>${hitDiceList}</hitDiceList>
<classResource>-1⊠-1⊠-1⊠-1⊠-1⊠-1⊠1⊠2⊠1000⊠3⊠4⊠5</classResource>
</character>`;
}
