export interface LoreSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  paragraphs: string[];
  bulletPoints?: { label: string; text: string }[];
}

export const KONRAN_WORLD_LORE: LoreSection[] = [
  {
    id: "konran-capital",
    title: "Konran: The Central World",
    subtitle: "Capital of the Pantheon & Convergence of Divine Dreams",
    icon: "Globe",
    summary: "Constructed through the combined efforts of The Nyne, Konran stands at the center of the system as a jewel where gods and mortals coexist in harmony.",
    paragraphs: [
      "Konran, the heart of the Konra System, stands as a testament to the combined efforts of all the Nyne Gods. Serving as the Capital of the Pantheon, this diverse and vibrant world embodies the dreams and aspirations of its divine rulers.",
      "Each region is ruled over by a god, bringing their unique influence and essence to the varied landscapes. From serene coasts to bustling cities and enchanted forests, Konran is a place where mortals and gods coexist in harmony and governs the cosmic flow of life and death energies."
    ],
    bulletPoints: [
      {
        label: "Vantya (The Capital City)",
        text: "Nestled on the equator between northern and southern hemispheres. Features four directional trade ports connected by grand canals. Buildings and neighborhoods transform overnight to mirror divine inspiration."
      },
      {
        label: "Lyvia Providence (Northern Hemisphere)",
        text: "Ruled by Lyricia. Vast plains, lush fields, and the Purple Plains studded with bioluminescent crystals. Shares an interwoven border with Kray Providence."
      },
      {
        label: "Kray Providence (Southern Hemisphere)",
        text: "Ruled by Krayvuk. Dense rainforest on the west, arid mineral wasteland on the east, split by a colossal river circling a dormant super volcano imbued with magnetic ore."
      },
      {
        label: "Sava Providence (Northern Hemisphere)",
        text: "Ruled by Ousava. Largest landmass on Konran. Home to the Golden Elves, an 18,000-ft drop waterfall, and the colossal mountain-sized Tree of Life."
      },
      {
        label: "Leste Providence (Southern Hemisphere)",
        text: "Ruled by Vevayun (Celeste). A twilight fae wilds swamp illuminated by fairy fire. Travelers ride inside hotels built upon the shells of giant snails across white marble shelves."
      },
      {
        label: "Oray Providence (Southern Hemisphere)",
        text: "Active super volcano spewing lava into the sea. Supports skylands, dragon cities, steam labs, and grand magic academies."
      },
      {
        label: "Kay Lands (Moving Caravan Islands)",
        text: "Ruled by Kayzoku. Circling chain of islands concealed in maelstroms. A tropical desert paradise controlled by warlords, filled with opulent luxury casinos."
      },
      {
        label: "The Patchwork Isles (Psyon's Skylands)",
        text: "Floating skylands off the coast of Kray Providence untethered by gravity, directions, or physics. A refuge for those cast out of normal reality."
      },
      {
        label: "The Dark UnderCrust (Slavyna's Haven)",
        text: "A shifting subterranean metropolis circling Konran's outer core. Protected by a cloaking charm known only to Slavyna, completely hidden from Lyricia's scholars."
      },
      {
        label: "Moons of Konran",
        text: "Olysphere (the white sentinel regulating tides and weather) and Ayanath (the purple watchtower moon housing the High Celestial Castle of the Nyne)."
      }
    ]
  },
  {
    id: "calendar-festivals",
    title: "Festivals & Holy Celebrations",
    subtitle: "The Sacred Calendar of The Nyne & Collective Conclaves",
    icon: "Calendar",
    summary: "Throughout the year, holy days unite mortals and deities alike across individual domains, overlapping virtues, and grand pantheon conclaves.",
    paragraphs: [
      "The Nyne celebrate both individual holy days and collective conclaves where mortals gather across the planes to renew contracts, celebrate feats, or seek divine blessings.",
      "Even gods with starkly contrasting alignments come together for sacred rituals—such as Ousava and Slavyna uniting during the Festival of Fertility to bless new unions and ensure the continuation of life."
    ],
    bulletPoints: [
      {
        label: "Life's Dawn Festival (2nd - 4th Ousava's Renewal)",
        text: "Marks the new year and rebirth of nature. Planting of crops and prayers to Ousava for abundant harvests."
      },
      {
        label: "Dragon's Flame Day (15th Oray's Scale)",
        text: "Celebration of arcane power and dragons. Dragon riders perform aerial ballets alongside steam-lab pyromancers."
      },
      {
        label: "Merchant's Exchange (27th Lyricia's Ledger)",
        text: "A continent-spanning bazaar celebrating commerce, new engineering inventions, and standardized banking."
      },
      {
        label: "Secret Revels (14th - 16th Slavyna's Whisper)",
        text: "Celebrates passion, desire, and secrets. Masked balls, clandestine gift exchanges, and whispered alliances."
      },
      {
        label: "Time's Eclipse (21st Krayvuk's Eclipse)",
        text: "The longest night of the year. Solemn rituals honoring the balance of life, death, and clockwork temporal cycles."
      },
      {
        label: "Mad Moon Night (30th Psyon's Veil)",
        text: "When Konran's two moons reach closest proximity. The planar veil thins, inducing wild visions, madness, and uninhibited magic."
      },
      {
        label: "Artisan's Forge (17th - 19th Vevayun's Forge)",
        text: "Art exhibitions, gladiatorial tourneys, and memorials honoring fallen warriors who created great masterworks."
      },
      {
        label: "The Great Game (8th Kayzoku's Gambit)",
        text: "Mental, physical, and high-stakes games of chance where Kayzoku smiles upon audacity and cunning."
      },
      {
        label: "Fate's Masquerade (1st Ay's Masquerade)",
        text: "Pilgrims wear intricate masks representing their hidden selves and divine aspirations, guided by Ay."
      },
      {
        label: "Harvest's End (28th Ousava's Renewal)",
        text: "Thanksgiving for the year's bounties, celebrating elemental abundance before the winter turn."
      },
      {
        label: "Ancestral Night (10th Krayvuk's Eclipse)",
        text: "Pilgrims commune with departed ancestors and seek guidance from spirits lingering in the outer corridors."
      },
      {
        label: "Festival of Great Feats (Vevayun & Kayzoku)",
        text: "Joint athletic and gladiatorial games balancing law and chaos, honoring martial triumph and high-stakes fortune."
      },
      {
        label: "Festival of Fertility (Ousava & Slavyna)",
        text: "Uniting life and passion, this festival blesses unions and bestows fertility across all species."
      },
      {
        label: "The Unity Conclave & Celestial Parade",
        text: "Centennial summit of all nine gods in Vantya, followed by a grand parade of divine avatars through the capital."
      }
    ]
  },
  {
    id: "alliances-rivalries",
    title: "The Dance of Alliances & Rivalries",
    subtitle: "Espionage, The O Order, and Precarious Pacts",
    icon: "Swords",
    summary: "The divine interactions of The Nyne range from unbreakable trinities to shadow cold wars and delicate temporary pacts.",
    paragraphs: [
      "Within the Konra System, the Nyne engage in an intricate dance of alignments and agendas. Their interactions ripple through mortal politics, altering trade routes and planar boundaries.",
      "To prevent mutual destruction, all treaties are governed by binding agreements. Yet each deity possesses an artful gift for keeping wording ambiguous, seeking loopholes to outmaneuver rivals."
    ],
    bulletPoints: [
      {
        label: "The O Order (Alliance of Good)",
        text: "Lyricia, Oray, and Ousava form an enduring tripartite alliance upholding justice, defending life, and preserving societal stability across the mortal planes."
      },
      {
        label: "The Espionage War (Slavyna vs. Lyricia)",
        text: "A perpetual shadow war. Slavyna uses lust, secrets, and covert agents to acquire leverage; Lyricia counters with legal audits, intellectual exposure, and encrypted ledgers."
      },
      {
        label: "Krayvuk's Great Mission",
        text: "Krayvuk pursues a solitary, enigmatic mission across space and time. He forms temporary alliances with Slavyna or other gods only when it advances his mysterious cosmic calculation."
      },
      {
        label: "Fragile Neutrality (Ay, Psyon, & Kayzoku)",
        text: "Because their domains encompass fate, madness, and trickery, pacts involving these three are notoriously brittle and prone to spontaneous upheaval."
      },
      {
        label: "Veiled Agreements & Ay's Arbitration",
        text: "When contractual loopholes cause planar disputes (such as territorial ambiguities between Ousava and Kayzoku), Ay is summoned as supreme, binding arbitrator whose verdict is irreversible."
      }
    ]
  },
  {
    id: "afterlife-and-duality",
    title: "Afterlife & The Cosmic Duality",
    subtitle: "Soul Purification, The Fall of Earth, and God Usurpation",
    icon: "Sparkles",
    summary: "Deities are not static statues—they evolve through The Duality, merge with parallel selves, and filter mortal souls through Konran.",
    paragraphs: [
      "In the Konra System, Konran functions as the afterlife filter. Souls of those who lived fulfilled lives aligned with their patron pass to Konran to enjoy contentment before choosing when to return to the universal cycle.",
      "Souls bearing heavy misdeeds are dispatched to the realms of Slavyna, Psyon, or Krayvuk for rigorous treatment and spiritual purification until their balance is restored."
    ],
    bulletPoints: [
      {
        label: "The Duality",
        text: "An evolutionary process where a god encounters their parallel self from another reality. Within a pocket dimension, the two selves merge—the dominant absorbing the secondary to adapt to evolving mortal worship."
      },
      {
        label: "The Fall of Earth & Oray's Transformation",
        text: "During the ancient cataclysm known as 'The Fall', Earth and its 18 human cities were destroyed. Grieving the devastation of spells, Oray underwent a Duality to embrace Earth's heritage, taking human survivors under his divine aegis."
      },
      {
        label: "The Assassination of Psyon & Rise of Ayvilo",
        text: "Psyon became the first god to suffer assassination. Plotted by Slavyna and Krayvuk during 'The Fall', a mirror duplicate of Lyricia named Ayvilo was orchestrated to strike down Psyon, permanently altering pantheon power."
      },
      {
        label: "Soul Filtering in Konran",
        text: "Devoted souls experience peace in the Providences of Konran, with the sovereign freedom to step back into the cosmic life current whenever they feel their journey is complete."
      }
    ]
  }
];
