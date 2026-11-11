// Structured data derived from the canonical Google Doc "Konran Glossary - 2/24" (cl/docs)

export interface GlossaryEntry {
  id: string;
  category: 'introduction' | 'planes' | 'deities' | 'demigods' | 'sects' | 'dc_checks' | 'titles';
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
  }
];
