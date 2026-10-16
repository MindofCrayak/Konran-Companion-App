import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "An ancient celestial relic from the Founding Gods is uncovered in Vantya. Which power do you seek to unlock?",
    category: "Planar Artifacts",
    options: [
      {
        text: "A bioluminescent crystal ledger that optimizes trade routes, engineering, and endless economic wealth.",
        deities: ["Lyricia", "Oray"]
      },
      {
        text: "A shifting prism of mist that fractures reality, inducing wild visions and uninhibited chaos.",
        deities: ["Psyon", "Kayzoku"]
      },
      {
        text: "An elemental seed from the colossal Tree of Life that restores barren worlds and purifies water.",
        deities: ["Ousava", "Celeste"]
      },
      {
        text: "A sacred woven mask that reveals the exact, unalterable thread of your woven destiny.",
        deities: ["Ay", "Krayvuk"]
      }
    ]
  },
  {
    id: 2,
    title: "Your home realm's planetary crust is unstable and collapsing into a void. What is your response?",
    category: "Crisis Management",
    options: [
      {
        text: "Harness raw arcane energy and command dragon riders to reinforce the crust through sheer magic and willpower.",
        deities: ["Oray", "Lyricia"]
      },
      {
        text: "Observe the temporal collapse dispassionately, gathering data on space-time mechanics for future calculations.",
        deities: ["Krayvuk", "Ay"]
      },
      {
        text: "Seize the panic to set up high-stakes bets on when it falls, escaping through a clever loophole during The Passing.",
        deities: ["Kayzoku", "Psyon"]
      },
      {
        text: "Rally warriors and artists to construct a grand amphitheater, performing a heroic final anthem before going into battle.",
        deities: ["Celeste", "Ousava"]
      }
    ]
  },
  {
    id: 3,
    title: "You uncover a devastating secret about a powerful rival faction. How do you handle it?",
    category: "Espionage & Justice",
    options: [
      {
        text: "Use it as covert leverage within a dark academy or pleasure palace to draw them into a web of vengeance.",
        deities: ["Slavyna", "Krayvuk"]
      },
      {
        text: "Present it directly to the legal courts of Vantya to enforce order, banking security, and societal justice.",
        deities: ["Lyricia", "Ousava"]
      },
      {
        text: "Guard it in silence—the Loom of Fate will weave retribution in its own sacred time without mortal meddling.",
        deities: ["Ay", "Oray"]
      },
      {
        text: "Encourage open dialogue, seeking reconciliation and community healing rather than destruction.",
        deities: ["Ousava", "Celeste"]
      }
    ]
  },
  {
    id: 4,
    title: "You attend a grand festival in Konran celebrating divine unity. Where are you found?",
    category: "Culture & Celebration",
    options: [
      {
        text: "Competing in the Festival of Great Feats, showcasing combat bravery, athletic mastery, and musical arts.",
        deities: ["Celeste", "Kayzoku"]
      },
      {
        text: "Navigating the moving caravan islands and risking fortunes at the luxury casinos.",
        deities: ["Kayzoku", "Psyon"]
      },
      {
        text: "Attending the Secret Revels, wearing an ornate mask while exchanging whispers in dimly lit alcoves.",
        deities: ["Slavyna", "Ay"]
      },
      {
        text: "Watching dragon riders execute aerial displays during Dragon's Flame Day alongside steam-lab mages.",
        deities: ["Oray", "Lyricia"]
      }
    ]
  },
  {
    id: 5,
    title: "How should a civilization structure its laws and social hierarchy?",
    category: "Philosophy of Order",
    options: [
      {
        text: "Divide society between order and chaos, where rules exist only to be outsmarted or exploited by the clever.",
        deities: ["Kayzoku", "Slavyna"]
      },
      {
        text: "Establish standardized contracts, mints, and engineering workshops to fuel societal growth.",
        deities: ["Lyricia", "Oray"]
      },
      {
        text: "Reject rigid constraints entirely; true freedom is found in the unpredictable, maddening turmoil of pure chaos.",
        deities: ["Psyon", "Kayzoku"]
      },
      {
        text: "Maintain strict discipline and respect for arcane order while honoring personal choice and individual evolution.",
        deities: ["Oray", "Krayvuk"]
      }
    ]
  },
  {
    id: 6,
    title: "When contemplating death and the passage of time across the planes...",
    category: "Mortality & Eternity",
    options: [
      {
        text: "Death is a measurable dimension of space and time, managed through clockwork precision and scientific study.",
        deities: ["Krayvuk", "Lyricia"]
      },
      {
        text: "Death is a natural, peaceful transition into the universal cycle of life, leading to the afterlife filter of Konran.",
        deities: ["Ousava", "Ay"]
      },
      {
        text: "Death is the fixed endpoint pre-woven on the Loom of Fate, requiring neither fear nor intervention.",
        deities: ["Ay", "Krayvuk"]
      },
      {
        text: "Death is an agonizing, unpredictable portal into madness and dark transformation.",
        deities: ["Psyon", "Slavyna"]
      }
    ]
  },
  {
    id: 7,
    title: "What constitutes the ultimate form of power in the Konran System?",
    category: "The Nature of Power",
    options: [
      {
        text: "Absolute mastery over raw dragonfire, ancient arcane arts, and personal choice.",
        deities: ["Oray", "Lyricia"]
      },
      {
        text: "Masterful control over desire, seduction, hidden secrets, and cold retribution.",
        deities: ["Slavyna", "Psyon"]
      },
      {
        text: "The perfection of physical competition, artistic beauty, and honorable warfare.",
        deities: ["Celeste", "Ousava"]
      },
      {
        text: "Complete control over space, time, and integrated clockwork-biological systems.",
        deities: ["Krayvuk", "Oray"]
      }
    ]
  },
  {
    id: 8,
    title: "Which environment feels most like home to your adventurer?",
    category: "Planar Environments",
    options: [
      {
        text: "Lush rainforests, tempestuous ocean tides, and giant elemental trees.",
        deities: ["Ousava", "Celeste"]
      },
      {
        text: "Bioluminescent crystal tunnels, bustling subterranean trade hubs, and grand mints.",
        deities: ["Lyricia", "Krayvuk"]
      },
      {
        text: "Floating, untethered Patchwork Isles where gravity shifts and reality fractures.",
        deities: ["Psyon", "Kayzoku"]
      },
      {
        text: "The hidden, shifting UnderCrust or opulent pleasure moons surrounded by shadows.",
        deities: ["Slavyna", "Ay"]
      }
    ]
  },
  {
    id: 9,
    title: "You are negotiating a binding pact or agreement with another party. What is your strategy?",
    category: "Diplomacy & Pacts",
    options: [
      {
        text: "Act as an impartial arbitrator, ensuring the pact aligns with cosmic balance and destiny.",
        deities: ["Ay", "Ousava"]
      },
      {
        text: "Draft the contract with ambiguous wording so you can exploit a clever loophole later.",
        deities: ["Kayzoku", "Slavyna"]
      },
      {
        text: "Embed complex technical clauses and temporal terms that guarantee your long-term scientific goals.",
        deities: ["Krayvuk", "Lyricia"]
      },
      {
        text: "Keep the terms honorable and public, tested through fair competition and mutual respect.",
        deities: ["Celeste", "Oray"]
      }
    ]
  },
  {
    id: 10,
    title: "When forced into open battle or combat, what guides your hand?",
    category: "Combat Ethos",
    options: [
      {
        text: "Fighting with passion, martial bravery, and glory to protect the hearth and inspire legend.",
        deities: ["Celeste", "Ousava"]
      },
      {
        text: "Commanding precise arcane spells and dragonfire to enforce tactical order and protect the weak.",
        deities: ["Oray", "Lyricia"]
      },
      {
        text: "Inflicting unpredictable pain, fear, and sheer madness upon all who stand in your way.",
        deities: ["Psyon", "Slavyna"]
      },
      {
        text: "Defending the natural ecosystem and elemental balance with fierce, protective devotion.",
        deities: ["Ousava", "Celeste"]
      }
    ]
  },
  {
    id: 11,
    title: "A former ally betrays your party to a rival faction. What is your response?",
    category: "Betrayal & Retribution",
    options: [
      {
        text: "Plot meticulous, covert retribution within dark subterranean chambers to gain total leverage over them.",
        deities: ["Slavyna", "Krayvuk"]
      },
      {
        text: "Report their breach of contract to the mints and legal guilds in Vantya to strip them of wealth and status.",
        deities: ["Lyricia", "Kayzoku"]
      },
      {
        text: "Challenge them directly to an open duel during the Festival of Great Feats.",
        deities: ["Celeste", "Oray"]
      },
      {
        text: "Accept the betrayal as a necessary, pre-woven thread in the grand tapestry of Fate.",
        deities: ["Ay", "Ousava"]
      }
    ]
  },
  {
    id: 12,
    title: "If you could establish your personal domain or stronghold anywhere in the Konran System, where would it be?",
    category: "Strongholds & Havens",
    options: [
      {
        text: "The moon of Kelth or Zorm, overseeing automated mints and endless artisan workshops.",
        deities: ["Lyricia", "Oray"]
      },
      {
        text: "The plane of Synthelavor, amidst dark academies, shadow schools, and opulent pleasure palaces.",
        deities: ["Slavyna", "Psyon"]
      },
      {
        text: "The mechanical lobe of Kestox, surrounded by liquid metal lakes and clockwork machine shops.",
        deities: ["Krayvuk", "Lyricia"]
      },
      {
        text: "The divided realm of Kee, leveraging willpower and intelligence to maintain absolute societal order.",
        deities: ["Kayzoku", "Krayvuk"]
      }
    ]
  },
  {
    id: 13,
    title: "A catastrophic planar disturbance threatens to collapse your local environment. How do you adapt?",
    category: "Cosmic Adaptation",
    options: [
      {
        text: "Wait for the annual alignment during The Passing to leap into a contrasting world and start fresh.",
        deities: ["Kayzoku", "Psyon"]
      },
      {
        text: "Perform rituals on Time's Eclipse or Ancestral Night to study space-time stability.",
        deities: ["Krayvuk", "Ay"]
      },
      {
        text: "Command dragon riders and steam-lab mages to reinforce the realm through raw arcane energy.",
        deities: ["Oray", "Lyricia"]
      },
      {
        text: "Open your home during Life's Dawn, providing shelter, warm hearths, and elemental healing to refugees.",
        deities: ["Ousava", "Celeste"]
      }
    ]
  },
  {
    id: 14,
    title: "How does your character view material gold, minted coins, and physical wealth?",
    category: "Treasury & Economy",
    options: [
      {
        text: "Essential instruments of industry and engineering that build grand cities, schools, and mints.",
        deities: ["Lyricia", "Krayvuk"]
      },
      {
        text: "Currency belongs on the gambling tables—risked, won, or lost in high-stakes games of chance!",
        deities: ["Kayzoku", "Psyon"]
      },
      {
        text: "Gold is irrelevant compared to the true value of untamed nature, elemental life, and community harmony.",
        deities: ["Ousava", "Celeste"]
      },
      {
        text: "Wealth is leverage—used to purchase loyalty, buy secrets, and fund clandestine networks.",
        deities: ["Slavyna", "Kayzoku"]
      }
    ]
  },
  {
    id: 15,
    title: "You discover an ancient, sealed repository containing forbidden planar secrets. How do you approach it?",
    category: "Forbidden Knowledge",
    options: [
      {
        text: "Systematize its contents to advance engineering, commerce, and societal knowledge.",
        deities: ["Lyricia", "Oray"]
      },
      {
        text: "Guard its secrets fiercely, sharing arcane wisdom only with disciplined mages who prove worthy.",
        deities: ["Oray", "Ay"]
      },
      {
        text: "Wear a sacred mask and consult the Weaver of Fate before deciding if the knowledge should ever be unsealed.",
        deities: ["Ay", "Slavyna"]
      },
      {
        text: "Analyze its historical timeline to map out the cosmic laws governing space and mortality.",
        deities: ["Krayvuk", "Lyricia"]
      }
    ]
  },
  {
    id: 16,
    title: "What is your perspective on societal laws, contracts, and legal systems?",
    category: "Jurisprudence",
    options: [
      {
        text: "Laws are rigid structures meant to be exploited; a contract is only as strong as its cleverest loophole.",
        deities: ["Kayzoku", "Slavyna"]
      },
      {
        text: "Laws are meaningless constraints that suppress the natural, beautiful chaos of existence.",
        deities: ["Psyon", "Kayzoku"]
      },
      {
        text: "Laws should honor natural balance and elemental harmony above arbitrary mortal authority.",
        deities: ["Ousava", "Ay"]
      },
      {
        text: "Laws should foster honorable competition, martial virtue, and artistic integrity.",
        deities: ["Celeste", "Oray"]
      }
    ]
  },
  {
    id: 17,
    title: "What drives your adventurer’s ultimate personal motivation?",
    category: "Inner Drive",
    options: [
      {
        text: "Uncovering deep secrets, mastering desire, and wielding subtle influence over others.",
        deities: ["Slavyna", "Psyon"]
      },
      {
        text: "Experiencing the raw thrill of high-stakes gambling, wild trickery, and total freedom.",
        deities: ["Kayzoku", "Celeste"]
      },
      {
        text: "Creating masterworks of art, winning combat grand prizes, and leaving a legendary legacy.",
        deities: ["Celeste", "Ousava"]
      },
      {
        text: "Protecting living ecosystems, healing the suffering, and nurturing vibrant communities.",
        deities: ["Ousava", "Lyricia"]
      }
    ]
  },
  {
    id: 18,
    title: "How do you feel about wearing disguises, maintaining double lives, or keeping secrets?",
    category: "Masks & Identity",
    options: [
      {
        text: "Masks are sacred items worn during Fate's Masquerade to display spiritual alignment and honor destiny.",
        deities: ["Ay", "Slavyna"]
      },
      {
        text: "Concealment is strategic—keeping secrets gives you ultimate leverage over enemies and allies alike.",
        deities: ["Slavyna", "Krayvuk"]
      },
      {
        text: "Disguises are chaotic pranks to confuse authorities and keep people guessing in the grand game of life.",
        deities: ["Psyon", "Kayzoku"]
      },
      {
        text: "Living openly and passionately is true strength; why hide who you are on the field of glory?",
        deities: ["Celeste", "Oray"]
      }
    ]
  },
  {
    id: 19,
    title: "When faced with a cosmic dilemma where free will and destiny clash...",
    category: "Free Will vs Destiny",
    options: [
      {
        text: "Destiny is woven on the Loom of Fate; every thread, emotion, and action is bound to cosmic balance.",
        deities: ["Ay", "Ousava"]
      },
      {
        text: "Choice is paramount; mages and dragon lords must master arcane discipline to forge their own destiny.",
        deities: ["Oray", "Lyricia"]
      },
      {
        text: "Destiny is an observable equation across space and time, waiting to be calculated and mastered.",
        deities: ["Krayvuk", "Ay"]
      },
      {
        text: "Fate is a farce; reality is an unpredictable nightmare of madness where nothing is fixed.",
        deities: ["Psyon", "Kayzoku"]
      }
    ]
  },
  {
    id: 20,
    title: "Which core motto best captures your adventurer's personal ethos?",
    category: "Sacred Credo",
    options: [
      {
        text: "\"Knowledge is power, and organized industry brings true prosperity.\"",
        deities: ["Lyricia", "Oray"]
      },
      {
        text: "\"Every action, emotion, and life thread is bound to the eternal balance of Destiny.\"",
        deities: ["Ay", "Ousava"]
      },
      {
        text: "\"Space and time are dimensions to be measured, observed, and controlled.\"",
        deities: ["Krayvuk", "Lyricia"]
      },
      {
        text: "\"Arcane mastery and noble discipline transcend mortal constraints.\"",
        deities: ["Oray", "Celeste"]
      }
    ]
  }
];
