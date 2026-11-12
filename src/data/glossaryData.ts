// Structured data derived from the canonical Google Doc "Konran Glossary - 2/24" (cl/docs)

export interface GlossaryEntry {
  id: string;
  category: 'introduction' | 'planes' | 'deities' | 'demigods' | 'sects' | 'dc_checks' | 'titles' | 'factions' | 'world';
  title: string;
  subtitle?: string;
  tags: string[];
  content: string;
  dcChecks?: { dc: number; check: string }[];
}

export const KONRAN_GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'intro-fated',
    category: 'introduction',
    title: 'The Konran Saga: Tales of the Fated',
    subtitle: 'New Player Welcome & Prime Law',
    tags: ['Fated', 'Arrival', 'Prime Law', 'Mydnight Rendezvous', 'Capital'],
    content: `You’ve been selected for an amazing journey of Fate. True, your family depended on you, but it is fate that you are here. Your destiny is meant to be elsewhere, to be more. You have been chosen by the great Nine Gods to come and live on the capital, to come to the plane of Konran.

Here on the Capital, there are no ancient ruins. Not much history. This world was built to house and home all of the gods' creation in a safe place. A place of dreams, that’s what the capital stands for: the best of the best.

The only true law of Konran stands: "Do not hunt, harm, maim or murder any sentient beings for pleasure, profit or ownership."

Upon arrival, travelers step out onto the soft purple stone road leading to "The Mydnight Rendezvous", welcomed into the high-fantasy magitek frontier.`
  },
  {
    id: 'plane-ayan',
    category: 'planes',
    title: 'Ayan (The Sun & Weaver\'s Core)',
    subtitle: 'Realm of Ay(an) // God(dess) of Fate & Destiny',
    tags: ['Sun', 'Ay', 'Fate', 'Lottery', 'Subterranean Core'],
    content: `The Sun of the system was strong and young. Ousava and Ay joined to repurpose its energy, channeling light into highways and tubes where travelers move at speeds unheard of in other realms. A world inhabited by those entwined with Fate. Light is used more like threads than rays, woven into cosmic stitches that mimic storms and boiling seas of solar heat.`
  },
  {
    id: 'plane-kay-kee',
    category: 'planes',
    title: 'Kay & Kee (The Twin Worlds)',
    subtitle: 'Realm of Kayzoku // Chaos & Order',
    tags: ['Kayzoku', 'Twin Worlds', 'The Passing', 'Kitsune', 'Chaos', 'Order'],
    content: `Torn in two by Kayzoku and Ousava.
- Kay: The top portion, a hot dry desert shaped like a mushroom. Deep hive metropolises ruled by pure chaos, scavengers, Kitsune, and warlords.
- Kee: The bottom portion, a flooded stone basin world ruled with strict social hierarchy by the Kits and Kitsune police.
- The Passing: Once each year, Kay and Kee align for a single day, allowing inhabitants to leap between worlds, exchanging Chaos for Order or vice versa.`
  },
  {
    id: 'plane-synthelavor',
    category: 'planes',
    title: 'Synthelavor & The 5 Moons',
    subtitle: 'Realm of Slavyna // Succubus Queen & The UnderCrust',
    tags: ['Slavyna', 'Synthelavor', 'Hells', 'Abyss', 'Moons', 'UnderCrust'],
    content: `The plane Slavyna rules with an iron hoof. Second from the sun, housing the elemental plane of fire with volcanic skylines, mines, and towering skyscrapers.
Five Moons circle Synthelavor within glittering red dust rings:
1. Tatyon: Close orbit, housing finishing academies and the Lust Wraiths.
2. Odahs: Dark rock, home to the School of Shadows.
3. Kark: Leisure and training grounds for The Dark Legion.
4. Syndavaria: Slavyna\'s personal capital world of pink seas, purple grasslands, and red mountains.
5. Hemalod: Far ocean moon, headquarters of the Brotherhood of Blood.`
  },
  {
    id: 'plane-lona-uyn',
    category: 'planes',
    title: 'Lona Uyn (The Crystal Nomadic World)',
    subtitle: 'Realm of Lyricia // Her Wysest & Divine Treasury',
    tags: ['Lyricia', 'Crystal', 'Hayde', 'Zorm', 'Sylef', 'Mint'],
    content: `A terrestrial world of craggy plateaus, bioluminescent crystal lattices, and aerial rock formations floating at varying altitudes.
Three Celestial Moons:
1. Kelth: Made of gold, home of the Hayde Genies who oversee the divine mint and treasury.
2. Zorm: Planet of the Forges. Endless underground workshops for inventors and artificers.
3. Sylef: Home of the Wise Elves, noble scholarly nocturnal rulers.`
  },
  {
    id: 'plane-konran',
    category: 'planes',
    title: 'Konran (The 10th Plane / Capital)',
    subtitle: 'Joint Creation of The Nyne',
    tags: ['Capital', 'Konran', 'Luna Prime', 'Luna Beta', 'Dyvine Council'],
    content: `Forged last as the unified Capital of the Pantheon. Konran represents the shared dream of the gods, combining magitek, crystal spell engines, and 18 cities from Earth deposited during The Fall.
Moons of Konran:
1. Luna Prime: Small white moon passing twice per 36-hour day, home to the secret Dyvine Council.
2. Luna Beta: Large purple gas giant marked by hypnotic swirling atmospheric bands.`
  },
  {
    id: 'plane-vaya-mar',
    category: 'planes',
    title: 'Vaya Mar & Lantyca\'s Kiss',
    subtitle: 'Realm of Ousava // Life Giver & Elements',
    tags: ['Ousava', 'Ocean', 'Lantyca', 'Waterspout', 'Salvage'],
    content: `An oceanic world of floating shipwreck metropolises, alternating between 8-month Wet and Dry seasons. During the Dry season transition, the rainforest moon Lantyca passes so close that waterspouts block the sun and trillions of gallons transfer directly between worlds ("Lantyca\'s Kiss"), exposing rich sunken plateaus for scavenging.`
  },
  {
    id: 'plane-kestox',
    category: 'planes',
    title: 'Kestox & Zraxsis Prime',
    subtitle: 'Realm of Krayvuk // The All-Seeing Eye',
    tags: ['Krayvuk', 'Kestox', 'Time', 'NecroTek', 'Earth Discovery'],
    content: `Bisected crater world shaped like a two-lobed brain: one biological canyon zone supporting the Skree, the other a machine complex of liquid metal lakes. Towered over by Krayvuk\'s gnarled spire and swirling maroon scrying eye. It was through Kestox\'s timeline web that Krayvuk discovered Earth and set the events of The Fall into motion.`
  },
  {
    id: 'deity-slavyna-full',
    category: 'deities',
    title: 'Slavyna (The Dark Madame)',
    subtitle: 'Her Vyciousness Majesty, Queen of the Succuby',
    tags: ['Slavyna', 'Portfolio', 'Demigods', 'Dogma', 'UnderCrust'],
    content: `Title: Her Vyciousness Majesty, Queen of the Succuby, Unyter of the Abyss, Conqueror of the Nyne Hells, Lord Mystress of Synthelavor, Dark Mother of The Dark Undercrust.
Portfolio: Sex, Lust, Vengeance, Society, Secrets, Spiders.
Favored Weapons: Whips, Sickles, Scimitars.
Domains: Art, beauty, civilization, intrigue, passion, vengeance, spiders, shadow elves.
Factions: Brotherhood of Blood, School of Shadows, Dark Legion, Spyder Systerhood, Lust Wraiths.
Seven Demigods: Audyanka (Shadow Elf), Konquestya (Devil Queen), Jarkyth (Tanar\'ri), Vantya (Princess), Gyoth (Orc Lord), Rozyr (Missing Prince), Lylthia (Emissary).`,
    dcChecks: [
      { dc: 10, check: 'Slavyna\'s hierarchy maintains a strict caste system: Kenku/Goblins at base, Orcs/Devils in military, Succubi/Shadow Elves at high court.' },
      { dc: 15, check: 'It is estimated 1 in 8 demons on Synthelavor is directly descended from Slavyna through her avatars.' },
      { dc: 20, check: 'Synthelavor secretly houses the Elemental Plane of Fire, providing infinite geothermal and volcanic mineral wealth.' },
      { dc: 30, check: 'Rozyr, her missing prince, wanders the planes as an Aberration Lord sighted across multiple worlds.' }
    ]
  },
  {
    id: 'dyvine-council',
    category: 'titles',
    title: 'The Dyvine Council of Luna Prime',
    subtitle: 'The Celestial Round Table',
    tags: ['Council', 'Luna Prime', 'Senate', 'Emyssari', 'Magystrate'],
    content: `Housed in a secret sanctuary on Luna Prime orbiting Konran. Features a colossal round table with a living holographic model of Konran at the center, surrounded by nine planetary thrones for The Nyne, flanked by a senate of Emyssari, Dyosans, and church archivists.`
  },
  {
    id: 'common-titles-konran',
    category: 'titles',
    title: 'Common Titles on Konran',
    subtitle: 'Ecclesiastical, Civic & Scholastic Ranks',
    tags: ['Titles', 'Emyssari', 'Magystrate', 'Dyosan', 'Protectorate', 'Grand Warden', 'Retcod', 'Keeper'],
    content: `Hierarchy and designated titles recognized across all Providences:
- Emyssari: Demigod child of two of The Nyne. Supreme leader of their Declared parents' Church & Clergy on Konran.
- Magystrate: A divine Inquisitor empowered by one of The Nyne to investigate heresy and prime law breaches.
- Dyosan: An elected mortal leader of a Church & Clergy.
- Protectorate: The democratically or canonically elected civic leader of an entire Providence.
- Grand Warden: Head of Security & Peace of a Providence, commanding regional garrisons.
- Retcod: A recognized scholastic professional of science, medicine, and lifecraft.
- [___] Keeper: The elite trained knowledge masters of Lyricia and her infinite Library of Ever.
- Peace Officers: The ubiquitous civic city watch maintaining municipal order in all settlements.`
  },
  {
    id: 'stone-enclave',
    category: 'factions',
    title: 'The Stone Enclave (Sororal Protectorate Army)',
    subtitle: 'Guardian Sisters of Konran',
    tags: ['Stone Enclave', 'Celeste', 'Military', 'Sororal Army', 'Statues'],
    content: `The protectorate military of Konran. A Sororal Army founded and trained by Celeste, composed of women recruited from all Providences. Battalions rotate continually across active, passive, and auxiliary tours. All major cities are adorned with colossal, silent stone statues of great size and number—sisters resting in stasis, sleeping until summoned to protect the realm.`
  },
  {
    id: 'konran-astronomy-calendar',
    category: 'world',
    title: 'Konran Planetary Measures & Calendar',
    subtitle: 'Temporal Mechanics of the 3rd Age',
    tags: ['Calendar', 'Ages', 'Time', 'Year', 'Moons', 'Era of Magic'],
    content: `Fundamental cosmic cycles of Konran:
- Year: 324 days, divided into 9 months of 36 days each.
- Weeks: 9-day weeks governed by liturgical cycles.
- Day Length: 36 hours long, with an 18-hour day and 18-hour night cycle. This grants all inhabitants generous spans for both leisure and high productivity.
- Epoch: Year 2,483 of the 3rd Age (The Age of The Arcane, proclaimed the "Era of Magic" during Original Harmony).
- Moons: 2 natural satellites—The Lyrisphere (Olysphere) and Ayanath.
- Demographics: 7 continents, 11 major capital cities, and 1.6 billion sentient beings.`
  }
];
