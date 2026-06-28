/* ============================================
   POKEMON WORLD - Static Data & Constants
   ============================================ */

const REGIONS = [
    { name: 'Kanto', gen: 1, range: [1, 151], emoji: '🏔️', color: '#ff4444',
      starters: ['bulbasaur', 'charmander', 'squirtle'],
      champion: 'Blue / Red', eliteFour: ['Lorelei', 'Bruno', 'Agatha', 'Lance'],
      gyms: ['Brock (Rock)', 'Misty (Water)', 'Lt. Surge (Electric)', 'Erika (Grass)', 'Koga (Poison)', 'Sabrina (Psychic)', 'Blaine (Fire)', 'Giovanni (Ground)'],
      desc: 'The original region where it all began. Home to 151 Pokemon and the Indigo League.' },
    { name: 'Johto', gen: 2, range: [152, 251], emoji: '🌸', color: '#3b82f6',
      starters: ['chikorita', 'cyndaquil', 'totodile'],
      champion: 'Lance', eliteFour: ['Will', 'Koga', 'Bruno', 'Karen'],
      gyms: ['Falkner (Flying)', 'Bugsy (Bug)', 'Whitney (Normal)', 'Morty (Ghost)', 'Chuck (Fighting)', 'Jasmine (Steel)', 'Pryce (Ice)', 'Clair (Dragon)'],
      desc: 'A region rich in tradition and history, connected to Kanto.' },
    { name: 'Hoenn', gen: 3, range: [252, 386], emoji: '🌊', color: '#22c55e',
      starters: ['treecko', 'torchic', 'mudkip'],
      champion: 'Steven / Wallace', eliteFour: ['Sidney', 'Phoebe', 'Glacia', 'Drake'],
      gyms: ['Roxanne (Rock)', 'Brawly (Fighting)', 'Wattson (Electric)', 'Flannery (Fire)', 'Norman (Normal)', 'Winona (Flying)', 'Tate & Liza (Psychic)', 'Juan/Wallace (Water)'],
      desc: 'A tropical region with vast oceans and diverse environments.' },
    { name: 'Sinnoh', gen: 4, range: [387, 493], emoji: '❄️', color: '#a855f7',
      starters: ['turtwig', 'chimchar', 'piplup'],
      champion: 'Cynthia', eliteFour: ['Aaron', 'Bertha', 'Flint', 'Lucian'],
      gyms: ['Roark (Rock)', 'Gardenia (Grass)', 'Maylene (Fighting)', 'Crasher Wake (Water)', 'Fantina (Ghost)', 'Byron (Steel)', 'Candice (Ice)', 'Volkner (Electric)'],
      desc: 'A northern region with snowy mountains and ancient myths.' },
    { name: 'Unova', gen: 5, range: [494, 649], emoji: '🏙️', color: '#f97316',
      starters: ['snivy', 'tepig', 'oshawott'],
      champion: 'Alder / Iris', eliteFour: ['Shauntal', 'Grimsley', 'Caitlin', 'Marshal'],
      gyms: ['Cilan/Chili/Cress', 'Lenora (Normal)', 'Burgh (Bug)', 'Elesa (Electric)', 'Clay (Ground)', 'Skyla (Flying)', 'Brycen (Ice)', 'Drayden/Iris (Dragon)'],
      desc: 'A modern, metropolitan region inspired by New York City.' },
    { name: 'Kalos', gen: 6, range: [650, 721], emoji: '🗼', color: '#ec4899',
      starters: ['chespin', 'fennekin', 'froakie'],
      champion: 'Diantha', eliteFour: ['Malva', 'Siebold', 'Wikstrom', 'Drasna'],
      gyms: ['Viola (Bug)', 'Grant (Rock)', 'Korrina (Fighting)', 'Ramos (Grass)', 'Clemont (Electric)', 'Valerie (Fairy)', 'Olympia (Psychic)', 'Wulfric (Ice)'],
      desc: 'An elegant region inspired by France, introducing Mega Evolution.' },
    { name: 'Alola', gen: 7, range: [722, 809], emoji: '🌺', color: '#06b6d4',
      starters: ['rowlet', 'litten', 'popplio'],
      champion: 'Player (first champion)', eliteFour: ['Hala', 'Olivia', 'Acerola', 'Kahili'],
      gyms: ['Island Trials instead of Gyms'],
      desc: 'A tropical island paradise with Island Trials instead of traditional Gyms.' },
    { name: 'Galar', gen: 8, range: [810, 898], emoji: '⚔️', color: '#8b5cf6',
      starters: ['grookey', 'scorbunny', 'sobble'],
      champion: 'Leon', eliteFour: ['No traditional Elite Four'],
      gyms: ['Milo (Grass)', 'Nessa (Water)', 'Kabu (Fire)', 'Bea/Allister (Fighting/Ghost)', 'Opal (Fairy)', 'Gordie/Melony (Rock/Ice)', 'Piers (Dark)', 'Raihan (Dragon)'],
      desc: 'A region inspired by the UK, featuring Dynamax and Gigantamax.' },
    { name: 'Paldea', gen: 9, range: [899, 1025], emoji: '📖', color: '#ef4444',
      starters: ['sprigatito', 'fuecoco', 'quaxly'],
      champion: 'Geeta', eliteFour: ['Rika', 'Poppy', 'Larry', 'Hassel'],
      gyms: ['Katy (Bug)', 'Brassius (Grass)', 'Iono (Electric)', 'Kofu (Water)', 'Larry (Normal)', 'Ryme (Ghost)', 'Tulip (Psychic)', 'Grusha (Ice)'],
      desc: 'An open-world region inspired by the Iberian Peninsula, featuring Terastallization.' }
];

const TYPE_COLORS = {
    normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
    grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
    ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
    rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
    steel: '#b8b8d0', fairy: '#ee99ac'
};

const TYPE_EFFECTIVENESS = {
    normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
    fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
    dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const LEGENDARIES = [144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,716,717,718,772,773,785,786,787,788,789,790,791,792,800,888,889,890,891,892,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1009,1010,1014,1015,1016,1017,1024,1025];
const MYTHICALS = [151,251,385,386,489,490,491,492,493,494,647,648,649,719,720,721,801,802,807,808,809,893];
const ULTRA_BEASTS = [793,794,795,796,797,798,799,803,804,805,806];

const NEWS_DATA = [
    { title: 'Pokemon Legends: Z-A Announced for 2025', tag: 'Games', emoji: '🎮',
      desc: 'The next mainline Pokemon game is set in Lumiose City, Kalos, featuring Mega Evolution\'s return.', date: 'June 2026' },
    { title: 'Pokemon TCG Pocket Surpasses 100M Downloads', tag: 'TCG', emoji: '🃏',
      desc: 'The mobile card game continues to break records with new expansion packs.', date: 'June 2026' },
    { title: 'Pokemon GO Fest 2026 Dates Revealed', tag: 'Pokemon GO', emoji: '📱',
      desc: 'Global Pokemon GO Fest events announced for cities around the world.', date: 'May 2026' },
    { title: 'New Pokemon Anime Season Continues', tag: 'Anime', emoji: '📺',
      desc: 'Pokemon Horizons continues with exciting new episodes following Liko and Roy.', date: 'June 2026' },
    { title: 'Pokemon Scarlet & Violet DLC Updates', tag: 'Games', emoji: '🎮',
      desc: 'New events and distributions continue for Gen 9 games.', date: 'May 2026' },
    { title: 'Competitive Pokemon VGC 2026 Season', tag: 'Competitive', emoji: '🏆',
      desc: 'World Championship qualifiers are underway with a new ruleset.', date: 'June 2026' }
];

const TRAINER_GUIDES = [
    { icon: '⚔️', title: 'Battle Basics', desc: 'Learn the fundamentals of Pokemon battling including type matchups, STAB, and priority moves.', difficulty: 'Beginner' },
    { icon: '📊', title: 'Type Matchup Chart', desc: 'Master all 18 type matchups to gain the upper hand in every battle.', difficulty: 'Beginner' },
    { icon: '🧬', title: 'EV & IV Training', desc: 'Understand Effort Values and Individual Values to optimize your Pokemon.', difficulty: 'Advanced' },
    { icon: '🏋️', title: 'Competitive Team Building', desc: 'Build winning teams for ranked battles and tournaments.', difficulty: 'Advanced' },
    { icon: '💎', title: 'Mega Evolution Guide', desc: 'Everything about Mega Evolution, Mega Stones, and the best Mega Pokemon.', difficulty: 'Intermediate' },
    { icon: '⭐', title: 'Z-Moves & Dynamax', desc: 'Master special battle mechanics from different generations.', difficulty: 'Intermediate' },
    { icon: '🃏', title: 'TCG Deck Building', desc: 'Build competitive Pokemon Trading Card Game decks from scratch.', difficulty: 'Beginner' },
    { icon: '🏆', title: 'Tournament Preparation', desc: 'Prepare for official Pokemon tournaments and championships.', difficulty: 'Advanced' },
    { icon: '🌟', title: 'Tera Types & Terastallization', desc: 'Unlock the power of Terastallization in Gen 9 battles.', difficulty: 'Intermediate' },
    { icon: '🤝', title: 'Double Battle Strategies', desc: 'Learn the unique strategies and synergies of double battles.', difficulty: 'Intermediate' },
    { icon: '📦', title: 'Held Items Guide', desc: 'The best held items and when to use them in competitive play.', difficulty: 'Beginner' },
    { icon: '🎯', title: 'Status Effects & Moves', desc: 'Understanding burn, paralysis, sleep, and other status conditions.', difficulty: 'Beginner' }
];

const POKEMON_FUN_FACTS = {
    1: 'Bulbasaur is the first Pokemon in the National Pokedex!',
    4: 'The flame on Charmander\'s tail indicates its health.',
    7: 'Squirtle\'s shell is not just for protection — it also reduces water resistance.',
    25: 'Pikachu was originally going to be the game mascot from the start!',
    39: 'Jigglypuff was a popular character in the anime for putting everyone to sleep.',
    94: 'Gengar is said to be Clefable\'s shadow.',
    130: 'Magikarp evolves into the fearsome Gyarados at level 20.',
    133: 'Eevee has the most evolution options of any Pokemon.',
    143: 'Snorlax eats 900 pounds of food per day!',
    149: 'Dragonite can fly around the globe in 16 hours.',
    150: 'Mewtwo was created through genetic manipulation of Mew.',
    151: 'Mew is said to contain the DNA of every Pokemon.',
    248: 'Tyranitar\'s Pokedex entry says it can topple mountains.',
    384: 'Rayquaza lives in the ozone layer and feeds on meteoroids.',
    445: 'Garchomp can fly at the speed of a jet plane.',
    658: 'Greninja\'s unique Bond Phenomenon gives it a special form.',
    778: 'Mimikyu wears a Pikachu disguise because it wants to be loved.',
    890: 'Eternatus is the tallest Pokemon at 65 feet 7 inches.',
    897: 'Calyrex was once the king of the Crown Tundra.'
};

const SAMPLE_STORES = [
    { name: 'Pokemon Center NYC', address: '10 Rockefeller Plaza, New York, NY', rating: 4.8, phone: '(212) 555-0100', hours: 'Mon-Sat 10am-8pm, Sun 11am-6pm', distance: '2.3 mi' },
    { name: 'Card Kingdom', address: '1234 Card Ave, Seattle, WA', rating: 4.7, phone: '(206) 555-0200', hours: 'Daily 10am-9pm', distance: '5.1 mi' },
    { name: 'Cool Stuff Games', address: '567 Game Blvd, Orlando, FL', rating: 4.5, phone: '(407) 555-0300', hours: 'Mon-Sat 11am-8pm, Sun 12pm-6pm', distance: '8.7 mi' },
    { name: 'TCGplayer Store', address: '890 Collector St, Syracuse, NY', rating: 4.6, phone: '(315) 555-0400', hours: 'Mon-Fri 9am-7pm, Sat 10am-5pm', distance: '12.4 mi' },
    { name: 'The Pokemon Vault', address: '321 Trainer Rd, Los Angeles, CA', rating: 4.9, phone: '(310) 555-0500', hours: 'Daily 10am-10pm', distance: '3.8 mi' },
    { name: 'Poke Collectors Hub', address: '456 Oak St, Chicago, IL', rating: 4.4, phone: '(312) 555-0600', hours: 'Mon-Sat 10am-7pm', distance: '6.2 mi' }
];

const ALL_TYPES = Object.keys(TYPE_COLORS);
