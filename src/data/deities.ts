import { Deity } from '../types';

export interface DeityExtended extends Deity {
  dndAlignment: 'LG' | 'LN' | 'NG' | 'TN' | 'CN' | 'CG' | 'CE' | 'NE' | 'LE';
  aspects: string[];
  chosenRaces: string[];
  homePlane: {
    name: string;
    description: string;
    moonsOrRegions?: string[];
  };
  festivals: string[];
  alliancesAndRivals: {
    allies: string;
    rivals: string;
  };
  dualityAndHistory: string;
}

export const DEITIES: Record<string, DeityExtended> = {
  Lyricia: {
    id: "Lyricia",
    name: "Lyricia",
    title: "Goddess of Knowledge, Money & Engineering",
    alignment: "Lawful Good (LG) • Patron of Industry & Truth",
    dndAlignment: "LG",
    aspects: ["Knowledge", "Money", "Engineering", "Commerce", "Enlightenment", "Healing"],
    domains: "Knowledge, Commerce, Engineering, Enlightenment, Healing",
    desc: "Overseeing the Rycia / Lyvia Providence on Konran and the bustling celestial world of Lona Uyn. Her followers pioneer subterranean labs, oversee trade mints, and seek truth and healing through structured enlightenment and intellectual brilliance.",
    color: "#ea32ca",
    fontClass: "font-Lyricia",
    imgBW: "https://i.imgur.com/MYVDHjH.png",
    chosenRaces: ["Skyrillians (Otters)", "Wise Elves", "High Elves", "Scholars of Konran"],
    homePlane: {
      name: "Lona Uyn",
      description: "A terrestrial world of azure waters, craggy plains, and floating aerial rock formations. Underneath lies an astonishing subterranean network of bioluminescent crystal lattices and engineering laboratories.",
      moonsOrRegions: [
        "Kelth: The Treasury of Wealth (mints overseen by Hayde genies)",
        "Zorm: The Moon of Forges (endless artisan workshops and invention foundries)",
        "Sylef: The Enclave of Wisdom (sanctum of the solitary, noble Wise Elves)"
      ]
    },
    factions: [
      "Institute of Enlightenment Scholars",
      "Oryginators of Zorm",
      "Treasurers of Kelth",
      "Sage Pryestesshood",
      "Coryal Collective"
    ],
    realm: "Lona Uyn & Lyvia Providence (Northern Konran)",
    festivals: [
      "Merchant's Exchange (27th Lyricia's Ledger)",
      "The Unity Conclave (with The Nyne)",
      "The O Order Summits"
    ],
    alliancesAndRivals: {
      allies: "The O Order (Lyricia, Oray, and Ousava - collective alliance of Good and order).",
      rivals: "Constant cold war of espionage with Slavyna, countering shadow networks with legal insight and truth."
    },
    dualityAndHistory: "A founding traveler who roamed the cosmos with Slavyna, Oray, and Kayzoku before forging Konran. Targets of Slavyna and Krayvuk's secret plotting during 'The Fall', which birthed her mirror self, Ayvilo.",
    divineBoon: {
      name: "Enlightened Blueprint",
      description: "Lyricia bestows clarity of engineering, economic foresight, and structured restorative art upon her pilgrims.",
      dndMechanic: "Once per long rest, when you make an Intelligence or Wisdom check related to technology, trade, or medicine, you can roll a d8 and add it to the total."
    },
    quote: "Through disciplined design, honest ledger, and unwavering truth, even the fractured cosmos finds restoration."
  },

  Oray: {
    id: "Oray",
    name: "Oray",
    title: "God of Magic, Dragons & Choice",
    alignment: "Lawful Neutral (LN) • Master of Magic & Arcane Arts",
    dndAlignment: "LN",
    aspects: ["Magic", "Dragons", "Choice", "Alteration", "Dragon Lore", "Spellcraft"],
    domains: "Raw Magic, Alteration, Dragon Lore, Spellcraft",
    desc: "The Dragonlord who commands raw arcane currents and reigns over dragonkind. A steadfast guardian of magical balance who guides mages, transmuters, and dragonwatchers across the realms.",
    color: "#c0c0c0",
    fontClass: "font-Oray",
    imgBW: "https://i.imgur.com/SxOctek.png",
    chosenRaces: ["Dragons", "Dragonkin", "Dragon Riders", "Earth's Human Survivors"],
    homePlane: {
      name: "Yngolcina",
      description: "A majestic volcanic world engulfed in eternal flames, magma waterfalls, and towering dragon cities of hardened obsidian. Beneath its surface, the world's core is slowly crumbling into a magical void, which Oray and his dragon disciples fiercely hold together with titanic arcane wards.",
      moonsOrRegions: [
        "Dragon Spire Calderas",
        "The Crumbling Arcane Void Core",
        "Oray Providence (Konran active super volcano & steam labs)"
      ]
    },
    factions: [
      "Practitioners of Magic",
      "Dragon Worshippers",
      "Substantyaliti",
      "Causalyti",
      "Superstitionists"
    ],
    realm: "Yngolcina & Oray Providence (Southern Konran)",
    festivals: [
      "Dragon's Flame Day (15th Oray's Scale)",
      "The Unity Conclave",
      "Festival of Great Feats (Joint Arcane Duels)"
    ],
    alliancesAndRivals: {
      allies: "The O Order (firm alliance with Lyricia and Ousava). Dedicated protector of mortal free choice.",
      rivals: "Suspicious of Psyon's madness and Krayvuk's calculating temporal tampering."
    },
    dualityAndHistory: "Following 'The Fall' and the cataclysmic destruction of Earth's 18 human cities, Oray underwent a profound Duality. Feeling remorse for the devastation of spells, he embraced Earth's heritage and took humanity under his divine wing.",
    divineBoon: {
      name: "Wyrmfire Resonance",
      description: "Oray channelizes raw arcane ley currents through your soul, attuning you to dragons and volatile spellwork.",
      dndMechanic: "Once per long rest, when you cast a spell or make a saving throw against magic, you can reroll a damage die or roll a d6 bonus to the save."
    },
    quote: "Reality is malleable parchment. With arcane discipline and free will, we rewrite destiny."
  },

  Ousava: {
    id: "Ousava",
    name: "Ousava",
    title: "The World-Mother • Goddess of Life & Elements",
    alignment: "Neutral Good (NG) • Mother of All",
    dndAlignment: "NG",
    aspects: ["Life", "Elements", "Creation", "Harmony", "Tides", "Fertility"],
    domains: "Life, Nature, Elements, Harmony, Tides, Creation",
    desc: "The primary architect and Mother of All who gathered the Founding Gods in her ink cocoon to navigate the Voyd. Ousava commands elemental life, ocean currents, and natural equilibrium throughout the Konra System.",
    color: "#9900ff",
    fontClass: "font-Ousava",
    imgBW: "https://i.imgur.com/80inyux.png",
    chosenRaces: ["Cecelia (Octopus People)", "Golden Elves", "Merfolk", "Elementals"],
    homePlane: {
      name: "Vaya Mar",
      description: "An awe-inspiring aquatic plane (92% water in wet season, 76% in dry) featuring thriving underwater civilizations and majestic coral cities, ruled by cyclical wet and dry tidal symphonies.",
      moonsOrRegions: [
        "Lantyca: The Verdant Moon (lush rainforests, rare wildlife, guarded by the Hayde genies)",
        "Sava Providence (Konran: home of the Golden Elves, 18,000-ft waterfall, and the colossal Tree of Life)"
      ]
    },
    factions: [
      "The Kabal of Lyfe",
      "Servants of the Seas",
      "The Elders of Earth",
      "The Ayr Acolytes",
      "The Fyre Fyends"
    ],
    realm: "Vaya Mar & Sava Providence (Northern Konran)",
    festivals: [
      "Life's Dawn Festival (2nd - 4th Ousava's Renewal)",
      "Harvest's End (28th Ousava's Renewal)",
      "Festival of Fertility (Co-celebrated with Slavyna)"
    ],
    alliancesAndRivals: {
      allies: "Anchor of The O Order with Lyricia and Oray. Collaborates with Slavyna for the Festival of Fertility despite opposing alignments.",
      rivals: "Constantly vigilant against Krayvuk's necrotic sterility and Psyon's chaotic desecration."
    },
    dualityAndHistory: "Joined forces with Ay to preserve the energy of the star Ayan at the dawn of the cosmos. Tilted the world of Kay-Kee with Kayzoku, creating the eternal dance between water and desert.",
    divineBoon: {
      name: "World-Mother's Vital Tide",
      description: "Ousava wraps you in primordial life energy, knitting flesh, stone, and spirit back into equilibrium.",
      dndMechanic: "Once per long rest as a bonus action, you or one creature within 30 feet can regain hit points equal to 2d8 + your character level."
    },
    quote: "All life ebbs and flows as tides in the ink cocoon. Protect the balance, and the world cradles you."
  },

  Ay: {
    id: "Ay",
    name: "Ay",
    title: "Weaver of Fate & Seamstress of Destiny",
    alignment: "True Neutral (TN) • Sovereign of Cosmic Balance",
    dndAlignment: "TN",
    aspects: ["Love", "Mask", "Fate", "Balance", "Destiny", "Time"],
    domains: "Love, Masks, Fate, Cosmic Balance, Destiny, Time",
    desc: "The enigmatic God/Goddess of Love, Masks, and Destiny who weaves the golden strands of Fate from the heart of the Sun-World Ayan. Serves as the supreme binding arbitrator of all divine pacts between the gods.",
    color: "#ff9900",
    fontClass: "font-Ay",
    imgBW: "https://i.imgur.com/E7AYFxL.png",
    chosenRaces: ["Eyracians (Hedgehog People)", "Masked Oracles", "Pilgrims of the Thread"],
    homePlane: {
      name: "Eye of Ay (The Radiant Sun Ayan)",
      description: "A subterranean paradise forged beneath the dazzling photosphere of the central star. Inhabitants live in deep canals, ridges, and luminous valleys, guarded from the blistering corona.",
      moonsOrRegions: [
        "The Golden Loom of Destiny at Ayan's Core",
        "Ayanath (Watchtower Moon of Konran housing the High Celestial Castle of the Nyne)",
        "The Polar Gateways of Konran"
      ]
    },
    factions: [
      "Foremen of Fate",
      "Agents of the Arrow",
      "Dreamers of Destiny",
      "Curators of Cause",
      "Exhibitors of Effect"
    ],
    realm: "Ayan (The Sun) & The Poles of Konran",
    festivals: [
      "Fate's Masquerade (1st Ay's Masquerade)",
      "Twin Moons Alignment (Mid-Year)",
      "The Unity Conclave (Chief Arbitrator)"
    ],
    alliancesAndRivals: {
      allies: "Strictly impartial. Works with Ousava to sustain Ayan's stellar furnace. Acts as binding judge for disputes across all Nyne.",
      rivals: "Maintains fragile neutrality with Kayzoku and Psyon, who often test the limits of woven destiny."
    },
    dualityAndHistory: "Ay closely guards the master blueprint of existence. Ay's masked devotees understand that peering into unspun destiny carries equal parts enlightenment and cosmic burden.",
    divineBoon: {
      name: "Severed Thread Intervention",
      description: "Ay reveals the golden strands of causality, granting you prescience to avert impending catastrophe.",
      dndMechanic: "Once per day, as a reaction when you or an ally within 30 ft makes an attack roll, saving throw, or ability check, you can grant advantage or impose disadvantage."
    },
    quote: "Every strand has its place in the golden loom. What has been measured cannot be undone."
  },

  Kayzoku: {
    id: "Kayzoku",
    name: "Kayzoku",
    title: "Lord of Kay-Kee & Master of Chance",
    alignment: "Chaotic Neutral (CN) • God of Trickery, Law, Chains & Gambling",
    dndAlignment: "CN",
    aspects: ["Trickery", "Law", "Chains", "Gambling", "Chaos", "High Stakes"],
    domains: "Trickery, Law, Chains, Gambling, Chaos, Balance",
    desc: "Ruler of the divided dual plane of Kay-Kee. A cunning trickster who thrives where high stakes, loophole contracts, and fortune collide, reminding mortals that rules exist to be outplayed.",
    color: "#8e7cc3",
    fontClass: "font-Kayzoku",
    imgBW: "https://i.imgur.com/CBojgKL.png",
    chosenRaces: ["Kitsune", "Kits", "Gamblers", "High-Stakes Vagabonds"],
    homePlane: {
      name: "Kay-Kee",
      description: "A divided world torn in two during an ancient tug-of-war with Ousava. The northern mushroom-shaped half, Kay, rotates clockwise—a scorching lawless desert ruled by warlords. The southern half, Kee, rotates counterclockwise—a world of water and rigid intellectual order.",
      moonsOrRegions: [
        "Kay (Desert of Chaos)",
        "Kee (Oceanic Realm of Rigid Law)",
        "Kay Lands (Moving Caravan of Luxury Casinos on Konran)",
        "The Passing (Annual alignment allowing planar leap)"
      ]
    },
    factions: [
      "Link of Trickery",
      "Link of Balance",
      "Link of Enlightenment",
      "Link of Deception",
      "Link of Order"
    ],
    realm: "Kay-Kee & Kay Lands (Moving Caravan Islands on Konran)",
    festivals: [
      "The Great Game (8th Kayzoku's Gambit)",
      "The Passing (Annual Leap Day)",
      "Festival of Great Feats (Joint athletic tourneys with Vevayun)"
    ],
    alliancesAndRivals: {
      allies: "Collaborates with Vevayun on athletic contests and martial spectacles. Occasional uneasy pacts with Psyon.",
      rivals: "Loathes rigid bureaucracy when it traps him, frequently baiting Lyricia with contractual loopholes."
    },
    dualityAndHistory: "One of the original 4 traveling companions. In his sheer excitement, he grabbed the world closest to the sun alongside Ousava, splitting it into two forever.",
    divineBoon: {
      name: "Gambler's Double-Down",
      description: "Kayzoku blesses those audacious enough to risk everything on the roll of a die or a cunning bluff.",
      dndMechanic: "Whenever you roll a natural 1 on a d20, you can immediately treat it as a natural 20 instead (recharges on a long rest)."
    },
    quote: "The house only wins if you play by their rules. Find the loophole, roll the bones, and own the room."
  },

  Celeste: {
    id: "Celeste",
    name: "Vevayun (Celeste)",
    title: "Goddess of Arts, Competition, Hearth & War",
    alignment: "Chaotic Good (CG) • Divine Champion of Expression & Glory",
    dndAlignment: "CG",
    aspects: ["Arts", "Competition", "Hearth", "War", "Athletics", "Heroism"],
    domains: "Arts, Competition, Hearth, War, Athletics, Expression",
    desc: "Known as Vevayun (and invoked as Celeste in liturgical anthems), she is the muse of artists, poets, and honorable gladiators. She governs the twin fires of passion: the creative forge of beauty and the valorous steel of war.",
    color: "#00cccc",
    fontClass: "font-Celeste",
    imgBW: "https://i.imgur.com/I5sUz2U.png",
    chosenRaces: ["Satyrs", "Valkyries", "Harpies", "Half-Humans", "Gladiators"],
    homePlane: {
      name: "Cadence",
      description: "A breathtaking Greco-Roman cultural paradise of lush emerald valleys, marble amphitheaters, and heroic monuments. Cadence houses the Elemental Plane of Earth at its center, providing enduring foundation for art and architecture.",
      moonsOrRegions: [
        "The Grand Amphitheater & Champion's Crucible",
        "Elemental Plane of Earth Foundation",
        "Leste Providence (Twilight Fae Wilds with giant snail hotel shell transports on Konran)"
      ]
    },
    factions: [
      "Order of Expression",
      "Order of Warfare",
      "Order of Athletics",
      "Order of the Hearth",
      "Order of Theory"
    ],
    realm: "Cadence & Leste Providence (Southern Konran)",
    festivals: [
      "Artisan's Forge (17th - 19th Vevayun's Forge)",
      "Festival of Great Feats (Joint Games with Kayzoku)",
      "The Celestial Parade"
    ],
    alliancesAndRivals: {
      allies: "Celebrates games and contests alongside Kayzoku. Close friend to Ousava, cherishing life and the hearth.",
      rivals: "Abhors Slavyna's cowardly poison and Krayvuk's cold, calculating cruelty."
    },
    dualityAndHistory: "Her influence sparked cultural renaissances across the Konra System. In times of war, her blessings grant strategic brilliance and honorable victory without mindless slaughter.",
    divineBoon: {
      name: "Anthem of the Champion",
      description: "Vevayun ignites martial passion and theatrical bravura in those who charge fearlessly into fray and forge.",
      dndMechanic: "Once per combat encounter, add your proficiency bonus to your weapon damage or Performance checks for 1 minute."
    },
    quote: "Let your deeds echo like a battle song. Fight with honor, create with fury, and inspire legends."
  },

  Psyon: {
    id: "Psyon",
    name: "Psyon",
    title: "God of Madness, Pain & Chaos",
    alignment: "Chaotic Evil (CE) • Lord of Duathyer",
    dndAlignment: "CE",
    aspects: ["Madness", "Pain", "Chaos", "Illusion", "Nightmares", "Memory Theft"],
    domains: "Madness, Pain, Chaos, Illusion, Memory Manipulation",
    desc: "Ruler of the dark, acid-bound plane of Duathyer. Psyon bends reality through unhinged paradox, memory manipulation, wild hallucinations, and pure anarchy. Souls of the unrepentant undergo agonizing purification in his mist.",
    color: "#ffffff",
    fontClass: "font-Psyon",
    imgBW: "https://i.imgur.com/RyHT82y.png",
    chosenRaces: ["Mindflayers", "Shades", "Nightmares", "Aberrations"],
    homePlane: {
      name: "Duathyer",
      description: "A hostile, skyless world with lakes of acid and impenetrable swirling mist where mortals see only in stark monochromatic nightmares. Life exists beneath the surface in total darkness, where time bends and sanity fractures.",
      moonsOrRegions: [
        "Acid Basins & The Mind Shatter Core",
        "The Patchwork Isles (Konran: floating skylands untethered by gravity or physics)"
      ]
    },
    factions: [
      "Lunaci",
      "Dementia",
      "Manya",
      "Delusyona",
      "Hysteria"
    ],
    realm: "Duathyer & The Patchwork Isles (Southern Konran)",
    festivals: [
      "Mad Moon Night (30th Psyon's Veil - barrier thinning)",
      "The Veil of Shadows",
      "The Night of Fractured Glass"
    ],
    alliancesAndRivals: {
      allies: "Unstable, temporary bargains with Kayzoku or Slavyna when mutual chaos serves them.",
      rivals: "Bitter enmity with The O Order. Targeted by Slavyna and Krayvuk for assassination via Ayvilo."
    },
    dualityAndHistory: "The first deity in the history of The Nyne to be assassinated and usurped. During 'The Fall', Slavyna and Krayvuk plotted to raise Ayvilo (a corrupted duplicate of Lyricia) to execute Psyon, leading to seismic shifts in pantheon politics.",
    divineBoon: {
      name: "Psychic Fracturing",
      description: "Psyon leaves an unhinged echo of psychic static in your consciousness that shatters hostile minds.",
      dndMechanic: "You have advantage on saving throws against charm, fear, and psychic effects. Once per short rest, you can deal 2d6 psychic damage to a creature attempting to touch your mind."
    },
    quote: "Sanity is a fragile cage built by timid architects. Shatter the bars and behold true revelation."
  },

  Krayvuk: {
    id: "Krayvuk",
    name: "Krayvuk",
    title: "God of Death, Space, Time & Science",
    alignment: "Neutral Evil (NE) • Lord of Kestox & Voyd Navigator",
    dndAlignment: "NE",
    aspects: ["Death", "Space", "Time", "Science", "Clockwork Mechanics", "Mortality"],
    domains: "Death, Space, Time, Science, Clockwork, Voyd Navigation",
    desc: "The cosmic strategist and master of temporal mechanics who navigates the Voyd and rules Kestox. He commands mortality, clockwork systems, and temporal equations to fulfill his secretive 'Great Mission'.",
    color: "#00ff66",
    fontClass: "font-Krayvuk",
    imgBW: "https://i.imgur.com/A256PSY.png",
    chosenRaces: ["Terrans", "Skree Hosts", "Cyborgs", "Temporal Engineers"],
    homePlane: {
      name: "Kestox (Keztox)",
      description: "A two-lobed world resembling a titanic cosmic brain. One lobe is biological—a network of canyons home to interdimensional Skree hosts. The other lobe is mechanical—bristling with clockwork machine shops, liquid metal lakes, and temporal laboratories.",
      moonsOrRegions: [
        "Biological Lobe (Canyons of the Skree Hosts)",
        "Mechanical Lobe (Liquid metal lakes and time chronometers)",
        "Kray Providence (Southern Konran: magnetic ore wasteland & dormant super volcano)"
      ]
    },
    factions: [
      "Vergence (Lords of Time)",
      "Cyrcutry System",
      "Expanz",
      "Necros",
      "Apogee"
    ],
    realm: "Kestox & Kray Providence (Southern Konran)",
    festivals: [
      "Time's Eclipse (21st Krayvuk's Eclipse - longest night)",
      "Ancestral Night (10th Krayvuk's Eclipse - honoring deceased)",
      "The Voyd Crossing"
    ],
    alliancesAndRivals: {
      allies: "Occasional ruthless collaborations with Slavyna when interests align. Navigates space-time for the pantheon.",
      rivals: "Deep tension with Ousava over the flow of life and souls. Opposed by The O Order."
    },
    dualityAndHistory: "Constantly working angles and engineering alliances in pursuit of his 'Great Mission' to rewrite the cosmic laws of space and mortality. Masterminded the creation of Ayvilo alongside Slavyna.",
    divineBoon: {
      name: "Temporal Chronometer",
      description: "Krayvuk aligns your heartbeat with clockwork stellar gears, granting temporal micro-adjustments.",
      dndMechanic: "You gain a +3 bonus to Initiative rolls. Once per long rest, you can take an additional Reaction on your turn."
    },
    quote: "Time is but a dimension of gears and planetary trajectories. Calculate accurately, and destiny obeys."
  },

  Slavyna: {
    id: "Slavyna",
    name: "Slavyna",
    title: "Goddess of Sex, Lust, Vengeance, Secrets & Revenge",
    alignment: "Lawful Evil (LE) • Her Imperial Viciousness & The Dark Mother",
    dndAlignment: "LE",
    aspects: ["Sex", "Lust", "Vengeance", "Secrets", "Revenge", "Blood Magic"],
    domains: "Sex, Lust, Vengeance, Secrets, Revenge, Leverage",
    desc: "The alluring and ruthless Dark Mother who rules Synthelavor with an iron hoof. Commands shadow academies, pleasure palaces, and covert spy networks across the planes to wield absolute leverage.",
    color: "#ff2233",
    fontClass: "font-Slavyna",
    imgBW: "https://i.imgur.com/YJBmwFe.png",
    chosenRaces: ["Shadow Elves", "Demons", "Orcs", "Goblins", "Tazloi"],
    homePlane: {
      name: "Synthelavor",
      description: "A blistering plane of jagged volcanic rocks and lava, harboring smaller sub-planes teeming with demons and savage beasts. Beneath its scorching crust lies an opulent labyrinth of pleasure palaces, shadow academies, and blood altars.",
      moonsOrRegions: [
        "Tatyon: Realm of Fervent Desire (finishing schools & Lust Wraiths)",
        "Odahs: The Veil of Shadows (School of Shadows)",
        "Kark: Training Oasis (hot springs of The Dark Legion)",
        "Syndavaria: Opulent Palace Pleasure Moon (Slavyna's personal capital)",
        "Hemalod: Domain of Bloodshed (Brotherhood of Blood)",
        "The Dark UnderCrust (Shifting subterranean city on Konran, hidden from Lyricia)"
      ]
    },
    factions: [
      "Spyder Systerhood",
      "Brotherhood of Blood",
      "School of Shadows",
      "The Dark Legion",
      "Lust Wraiths"
    ],
    realm: "Synthelavor & The Dark UnderCrust (Konran)",
    festivals: [
      "Secret Revels (14th - 16th Slavyna's Whisper)",
      "Festival of Fertility (Jointly blessed with Ousava)",
      "Twin Moons Night of Prophecy"
    ],
    alliancesAndRivals: {
      allies: "Tactical pacts with Krayvuk. Joins Ousava for the sacred Festival of Fertility to bless new life.",
      rivals: "Perpetual espionage war with Lyricia. Distrusts Oray's righteous discipline."
    },
    dualityAndHistory: "One of the four founding travelers. Provided part of Synthelavor to house the elemental plane of fire for Ousava. Plotted during 'The Fall' with Krayvuk to assassinate Psyon using the usurper Ayvilo.",
    divineBoon: {
      name: "Vicious Leverage",
      description: "Slavyna whispers dark secrets and sovereign dominance into your ear, granting unmatched social and tactical leverage.",
      dndMechanic: "You gain proficiency in Deception or Stealth. When striking an unsuspecting creature or successfully deceiving a foe, add 1d10 necrotic damage."
    },
    quote: "Power is not given, nor is it begged for. It is extracted through leverage, blood, and silence."
  }
};

export const DEITY_IDS = Object.keys(DEITIES);
