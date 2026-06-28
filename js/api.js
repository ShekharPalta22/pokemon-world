/* ============================================
   POKEMON WORLD - API Layer
   Uses embedded data (works offline/blocked networks)
   Falls back to PokeAPI when available
   ============================================ */

const POKEAPI = 'https://pokeapi.co/api/v2';
const TCG_API = 'https://api.pokemontcg.io/v2';
let apiAvailable = null; // null = untested, true/false after test

async function testApiAvailability() {
    if (apiAvailable !== null) return apiAvailable;
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${POKEAPI}/pokemon/1`, { signal: controller.signal });
        apiAvailable = res.ok;
    } catch {
        apiAvailable = false;
    }
    console.log(`PokeAPI available: ${apiAvailable}`);
    return apiAvailable;
}

// Test API on load
testApiAvailability();

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function pokemonImageUrl(id) {
    const spriteId = id >= 10000 ? id % 10000 : id;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${spriteId}.png`;
}

function pokemonSpriteUrl(id) {
    const spriteId = id >= 10000 ? id % 10000 : id;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`;
}

function pokemonShinyUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

function getLocalPokemon(idOrName) {
    const key = String(idOrName).toLowerCase();
    const byName = POKEMON_MAP[key];
    if (byName) return formatLocalPokemon(byName);
    const byId = POKEMON_BY_ID[parseInt(key)];
    if (byId) return formatLocalPokemon(byId);
    return null;
}

function formatLocalPokemon(p) {
    return {
        id: p.id,
        name: p.name,
        types: p.types_full,
        stats: p.stats,
        height: p.height,
        weight: p.weight,
        abilities: p.abilities,
        base_experience: p.base_experience,
        moves: generateMoves(p.types),
        sprites: {
            front_default: pokemonSpriteUrl(p.id),
            other: { 'official-artwork': { front_default: pokemonImageUrl(p.id) } }
        },
        _local: true,
        _flavor: p.flavor_text
    };
}

function generateMoves(types) {
    const moveSets = {
        normal: [
            {n:'tackle',t:'normal',c:'physical',p:40},{n:'body-slam',t:'normal',c:'physical',p:85},{n:'hyper-beam',t:'normal',c:'special',p:150},
            {n:'quick-attack',t:'normal',c:'physical',p:40},{n:'swift',t:'normal',c:'special',p:60},{n:'return',t:'normal',c:'physical',p:102},
            {n:'facade',t:'normal',c:'physical',p:70},{n:'giga-impact',t:'normal',c:'physical',p:150},{n:'double-edge',t:'normal',c:'physical',p:120},
            {n:'headbutt',t:'normal',c:'physical',p:70},{n:'slam',t:'normal',c:'physical',p:80},{n:'take-down',t:'normal',c:'physical',p:90},
            {n:'scratch',t:'normal',c:'physical',p:40},{n:'pound',t:'normal',c:'physical',p:40},{n:'mega-punch',t:'normal',c:'physical',p:80},
            {n:'mega-kick',t:'normal',c:'physical',p:120},{n:'strength',t:'normal',c:'physical',p:80},{n:'cut',t:'normal',c:'physical',p:50},
            {n:'rage',t:'normal',c:'physical',p:20},{n:'thrash',t:'normal',c:'physical',p:120},{n:'skull-bash',t:'normal',c:'physical',p:130},
            {n:'fury-attack',t:'normal',c:'physical',p:15},{n:'horn-attack',t:'normal',c:'physical',p:65},{n:'stomp',t:'normal',c:'physical',p:65},
            {n:'covet',t:'normal',c:'physical',p:60},{n:'round',t:'normal',c:'special',p:60},{n:'echoed-voice',t:'normal',c:'special',p:40},
            {n:'retaliate',t:'normal',c:'physical',p:70},{n:'last-resort',t:'normal',c:'physical',p:140},{n:'tera-blast',t:'normal',c:'special',p:80}
        ],
        fire: [
            {n:'ember',t:'fire',c:'special',p:40},{n:'flamethrower',t:'fire',c:'special',p:90},{n:'fire-blast',t:'fire',c:'special',p:110},
            {n:'fire-punch',t:'fire',c:'physical',p:75},{n:'flame-wheel',t:'fire',c:'physical',p:60},{n:'heat-wave',t:'fire',c:'special',p:95},
            {n:'overheat',t:'fire',c:'special',p:130},{n:'fire-spin',t:'fire',c:'special',p:35},{n:'inferno',t:'fire',c:'special',p:100},
            {n:'blaze-kick',t:'fire',c:'physical',p:85},{n:'flare-blitz',t:'fire',c:'physical',p:120},{n:'flame-charge',t:'fire',c:'physical',p:50},
            {n:'fire-fang',t:'fire',c:'physical',p:65},{n:'mystical-fire',t:'fire',c:'special',p:75},{n:'incinerate',t:'fire',c:'special',p:60},
            {n:'lava-plume',t:'fire',c:'special',p:80},{n:'eruption',t:'fire',c:'special',p:150},{n:'burn-up',t:'fire',c:'special',p:130},
            {n:'fire-lash',t:'fire',c:'physical',p:80},{n:'pyro-ball',t:'fire',c:'physical',p:120},{n:'burning-jealousy',t:'fire',c:'special',p:70},
            {n:'will-o-wisp',t:'fire',c:'status',p:0},{n:'sunny-day',t:'fire',c:'status',p:0}
        ],
        water: [
            {n:'water-gun',t:'water',c:'special',p:40},{n:'surf',t:'water',c:'special',p:90},{n:'hydro-pump',t:'water',c:'special',p:110},
            {n:'aqua-tail',t:'water',c:'physical',p:90},{n:'waterfall',t:'water',c:'physical',p:80},{n:'scald',t:'water',c:'special',p:80},
            {n:'bubble-beam',t:'water',c:'special',p:65},{n:'water-pulse',t:'water',c:'special',p:60},{n:'muddy-water',t:'water',c:'special',p:90},
            {n:'aqua-jet',t:'water',c:'physical',p:40},{n:'dive',t:'water',c:'physical',p:80},{n:'brine',t:'water',c:'special',p:65},
            {n:'whirlpool',t:'water',c:'special',p:35},{n:'rain-dance',t:'water',c:'status',p:0},{n:'hydro-cannon',t:'water',c:'special',p:150},
            {n:'liquidation',t:'water',c:'physical',p:85},{n:'sparkling-aria',t:'water',c:'special',p:90},{n:'flip-turn',t:'water',c:'physical',p:60},
            {n:'snipe-shot',t:'water',c:'special',p:80},{n:'water-shuriken',t:'water',c:'special',p:15},{n:'razor-shell',t:'water',c:'physical',p:75},
            {n:'crabhammer',t:'water',c:'physical',p:100},{n:'origin-pulse',t:'water',c:'special',p:110}
        ],
        grass: [
            {n:'vine-whip',t:'grass',c:'physical',p:45},{n:'razor-leaf',t:'grass',c:'physical',p:55},{n:'solar-beam',t:'grass',c:'special',p:120},
            {n:'giga-drain',t:'grass',c:'special',p:75},{n:'leaf-blade',t:'grass',c:'physical',p:90},{n:'energy-ball',t:'grass',c:'special',p:90},
            {n:'seed-bomb',t:'grass',c:'physical',p:80},{n:'leaf-storm',t:'grass',c:'special',p:130},{n:'power-whip',t:'grass',c:'physical',p:120},
            {n:'grass-knot',t:'grass',c:'special',p:0},{n:'bullet-seed',t:'grass',c:'physical',p:25},{n:'mega-drain',t:'grass',c:'special',p:40},
            {n:'absorb',t:'grass',c:'special',p:20},{n:'petal-dance',t:'grass',c:'special',p:120},{n:'petal-blizzard',t:'grass',c:'physical',p:90},
            {n:'wood-hammer',t:'grass',c:'physical',p:120},{n:'horn-leech',t:'grass',c:'physical',p:75},{n:'leaf-tornado',t:'grass',c:'special',p:65},
            {n:'magical-leaf',t:'grass',c:'special',p:60},{n:'frenzy-plant',t:'grass',c:'special',p:150},{n:'grassy-glide',t:'grass',c:'physical',p:55},
            {n:'leech-seed',t:'grass',c:'status',p:0},{n:'sleep-powder',t:'grass',c:'status',p:0},{n:'stun-spore',t:'grass',c:'status',p:0},
            {n:'synthesis',t:'grass',c:'status',p:0}
        ],
        electric: [
            {n:'thunder-shock',t:'electric',c:'special',p:40},{n:'thunderbolt',t:'electric',c:'special',p:90},{n:'thunder',t:'electric',c:'special',p:110},
            {n:'spark',t:'electric',c:'physical',p:65},{n:'discharge',t:'electric',c:'special',p:80},{n:'volt-switch',t:'electric',c:'special',p:70},
            {n:'wild-charge',t:'electric',c:'physical',p:90},{n:'thunder-punch',t:'electric',c:'physical',p:75},{n:'electro-ball',t:'electric',c:'special',p:0},
            {n:'volt-tackle',t:'electric',c:'physical',p:120},{n:'thunder-wave',t:'electric',c:'status',p:0},{n:'charge-beam',t:'electric',c:'special',p:50},
            {n:'nuzzle',t:'electric',c:'physical',p:20},{n:'thunder-fang',t:'electric',c:'physical',p:65},{n:'shock-wave',t:'electric',c:'special',p:60},
            {n:'zap-cannon',t:'electric',c:'special',p:120},{n:'bolt-strike',t:'electric',c:'physical',p:130},{n:'fusion-bolt',t:'electric',c:'physical',p:100},
            {n:'parabolic-charge',t:'electric',c:'special',p:65},{n:'zing-zap',t:'electric',c:'physical',p:80},{n:'rising-voltage',t:'electric',c:'special',p:70},
            {n:'overdrive',t:'electric',c:'special',p:80},{n:'electroweb',t:'electric',c:'special',p:55}
        ],
        ice: [
            {n:'ice-beam',t:'ice',c:'special',p:90},{n:'blizzard',t:'ice',c:'special',p:110},{n:'ice-punch',t:'ice',c:'physical',p:75},
            {n:'icy-wind',t:'ice',c:'special',p:55},{n:'ice-shard',t:'ice',c:'physical',p:40},{n:'frost-breath',t:'ice',c:'special',p:60},
            {n:'freeze-dry',t:'ice',c:'special',p:70},{n:'aurora-beam',t:'ice',c:'special',p:65},{n:'glaciate',t:'ice',c:'special',p:65},
            {n:'avalanche',t:'ice',c:'physical',p:60},{n:'powder-snow',t:'ice',c:'special',p:40},{n:'ice-fang',t:'ice',c:'physical',p:65},
            {n:'icicle-crash',t:'ice',c:'physical',p:85},{n:'icicle-spear',t:'ice',c:'physical',p:25},{n:'aurora-veil',t:'ice',c:'status',p:0},
            {n:'hail',t:'ice',c:'status',p:0},{n:'sheer-cold',t:'ice',c:'special',p:0},{n:'triple-axel',t:'ice',c:'physical',p:20},
            {n:'ice-spinner',t:'ice',c:'physical',p:80}
        ],
        fighting: [
            {n:'karate-chop',t:'fighting',c:'physical',p:50},{n:'low-kick',t:'fighting',c:'physical',p:0},{n:'brick-break',t:'fighting',c:'physical',p:75},
            {n:'close-combat',t:'fighting',c:'physical',p:120},{n:'aura-sphere',t:'fighting',c:'special',p:80},{n:'focus-blast',t:'fighting',c:'special',p:120},
            {n:'drain-punch',t:'fighting',c:'physical',p:75},{n:'cross-chop',t:'fighting',c:'physical',p:100},{n:'dynamic-punch',t:'fighting',c:'physical',p:100},
            {n:'mach-punch',t:'fighting',c:'physical',p:40},{n:'high-jump-kick',t:'fighting',c:'physical',p:130},{n:'sky-uppercut',t:'fighting',c:'physical',p:85},
            {n:'focus-punch',t:'fighting',c:'physical',p:150},{n:'superpower',t:'fighting',c:'physical',p:120},{n:'hammer-arm',t:'fighting',c:'physical',p:100},
            {n:'force-palm',t:'fighting',c:'physical',p:60},{n:'circle-throw',t:'fighting',c:'physical',p:60},{n:'low-sweep',t:'fighting',c:'physical',p:65},
            {n:'counter',t:'fighting',c:'physical',p:0},{n:'revenge',t:'fighting',c:'physical',p:60},{n:'bulk-up',t:'fighting',c:'status',p:0},
            {n:'detect',t:'fighting',c:'status',p:0}
        ],
        poison: [
            {n:'poison-sting',t:'poison',c:'physical',p:15},{n:'sludge-bomb',t:'poison',c:'special',p:90},{n:'sludge-wave',t:'poison',c:'special',p:95},
            {n:'toxic',t:'poison',c:'status',p:0},{n:'poison-jab',t:'poison',c:'physical',p:80},{n:'cross-poison',t:'poison',c:'physical',p:70},
            {n:'gunk-shot',t:'poison',c:'physical',p:120},{n:'venoshock',t:'poison',c:'special',p:65},{n:'acid',t:'poison',c:'special',p:40},
            {n:'acid-spray',t:'poison',c:'special',p:40},{n:'sludge',t:'poison',c:'special',p:65},{n:'poison-fang',t:'poison',c:'physical',p:50},
            {n:'poison-tail',t:'poison',c:'physical',p:50},{n:'smog',t:'poison',c:'special',p:30},{n:'clear-smog',t:'poison',c:'special',p:50},
            {n:'venom-drench',t:'poison',c:'status',p:0},{n:'coil',t:'poison',c:'status',p:0},{n:'toxic-spikes',t:'poison',c:'status',p:0},
            {n:'baneful-bunker',t:'poison',c:'status',p:0},{n:'poison-powder',t:'poison',c:'status',p:0}
        ],
        ground: [
            {n:'earthquake',t:'ground',c:'physical',p:100},{n:'dig',t:'ground',c:'physical',p:80},{n:'earth-power',t:'ground',c:'special',p:90},
            {n:'mud-shot',t:'ground',c:'special',p:55},{n:'mud-slap',t:'ground',c:'special',p:20},{n:'bulldoze',t:'ground',c:'physical',p:60},
            {n:'drill-run',t:'ground',c:'physical',p:80},{n:'bone-rush',t:'ground',c:'physical',p:25},{n:'sand-tomb',t:'ground',c:'physical',p:35},
            {n:'high-horsepower',t:'ground',c:'physical',p:95},{n:'magnitude',t:'ground',c:'physical',p:0},{n:'bone-club',t:'ground',c:'physical',p:65},
            {n:'bonemerang',t:'ground',c:'physical',p:50},{n:'stomping-tantrum',t:'ground',c:'physical',p:75},{n:'precipice-blades',t:'ground',c:'physical',p:120},
            {n:'thousand-arrows',t:'ground',c:'physical',p:90},{n:'sand-attack',t:'ground',c:'status',p:0},{n:'spikes',t:'ground',c:'status',p:0},
            {n:'shore-up',t:'ground',c:'status',p:0},{n:'scorching-sands',t:'ground',c:'special',p:70}
        ],
        flying: [
            {n:'gust',t:'flying',c:'special',p:40},{n:'air-slash',t:'flying',c:'special',p:75},{n:'fly',t:'flying',c:'physical',p:90},
            {n:'aerial-ace',t:'flying',c:'physical',p:60},{n:'brave-bird',t:'flying',c:'physical',p:120},{n:'hurricane',t:'flying',c:'special',p:110},
            {n:'wing-attack',t:'flying',c:'physical',p:60},{n:'drill-peck',t:'flying',c:'physical',p:80},{n:'sky-attack',t:'flying',c:'special',p:140},
            {n:'acrobatics',t:'flying',c:'physical',p:55},{n:'peck',t:'flying',c:'physical',p:35},{n:'pluck',t:'flying',c:'physical',p:60},
            {n:'air-cutter',t:'flying',c:'special',p:60},{n:'bounce',t:'flying',c:'physical',p:85},{n:'dual-wingbeat',t:'flying',c:'physical',p:40},
            {n:'oblivion-wing',t:'flying',c:'special',p:80},{n:'roost',t:'flying',c:'status',p:0},{n:'tailwind',t:'flying',c:'status',p:0},
            {n:'defog',t:'flying',c:'status',p:0},{n:'feather-dance',t:'flying',c:'status',p:0}
        ],
        psychic: [
            {n:'confusion',t:'psychic',c:'special',p:50},{n:'psychic',t:'psychic',c:'special',p:90},{n:'psybeam',t:'psychic',c:'special',p:65},
            {n:'future-sight',t:'psychic',c:'special',p:120},{n:'zen-headbutt',t:'psychic',c:'physical',p:80},{n:'psycho-cut',t:'psychic',c:'physical',p:70},
            {n:'extrasensory',t:'psychic',c:'special',p:80},{n:'psyshock',t:'psychic',c:'special',p:80},{n:'stored-power',t:'psychic',c:'special',p:20},
            {n:'expanding-force',t:'psychic',c:'special',p:80},{n:'dream-eater',t:'psychic',c:'special',p:100},{n:'psycho-boost',t:'psychic',c:'special',p:140},
            {n:'luster-purge',t:'psychic',c:'special',p:70},{n:'mist-ball',t:'psychic',c:'special',p:70},{n:'prismatic-laser',t:'psychic',c:'special',p:160},
            {n:'photon-geyser',t:'psychic',c:'special',p:100},{n:'calm-mind',t:'psychic',c:'status',p:0},{n:'reflect',t:'psychic',c:'status',p:0},
            {n:'light-screen',t:'psychic',c:'status',p:0},{n:'trick-room',t:'psychic',c:'status',p:0},{n:'hypnosis',t:'psychic',c:'status',p:0},
            {n:'teleport',t:'psychic',c:'status',p:0},{n:'agility',t:'psychic',c:'status',p:0}
        ],
        bug: [
            {n:'bug-bite',t:'bug',c:'physical',p:60},{n:'x-scissor',t:'bug',c:'physical',p:80},{n:'signal-beam',t:'bug',c:'special',p:75},
            {n:'megahorn',t:'bug',c:'physical',p:120},{n:'bug-buzz',t:'bug',c:'special',p:90},{n:'u-turn',t:'bug',c:'physical',p:70},
            {n:'fury-cutter',t:'bug',c:'physical',p:40},{n:'silver-wind',t:'bug',c:'special',p:60},{n:'struggle-bug',t:'bug',c:'special',p:50},
            {n:'leech-life',t:'bug',c:'physical',p:80},{n:'pin-missile',t:'bug',c:'physical',p:25},{n:'twin-needle',t:'bug',c:'physical',p:25},
            {n:'fell-stinger',t:'bug',c:'physical',p:50},{n:'lunge',t:'bug',c:'physical',p:80},{n:'first-impression',t:'bug',c:'physical',p:90},
            {n:'pollen-puff',t:'bug',c:'special',p:90},{n:'string-shot',t:'bug',c:'status',p:0},{n:'sticky-web',t:'bug',c:'status',p:0},
            {n:'tail-glow',t:'bug',c:'status',p:0},{n:'quiver-dance',t:'bug',c:'status',p:0}
        ],
        rock: [
            {n:'rock-throw',t:'rock',c:'physical',p:50},{n:'rock-slide',t:'rock',c:'physical',p:75},{n:'stone-edge',t:'rock',c:'physical',p:100},
            {n:'power-gem',t:'rock',c:'special',p:80},{n:'ancient-power',t:'rock',c:'special',p:60},{n:'rock-blast',t:'rock',c:'physical',p:25},
            {n:'smack-down',t:'rock',c:'physical',p:50},{n:'rock-tomb',t:'rock',c:'physical',p:60},{n:'head-smash',t:'rock',c:'physical',p:150},
            {n:'accelerock',t:'rock',c:'physical',p:40},{n:'rock-wrecker',t:'rock',c:'physical',p:150},{n:'diamond-storm',t:'rock',c:'physical',p:100},
            {n:'rollout',t:'rock',c:'physical',p:30},{n:'sandstorm',t:'rock',c:'status',p:0},{n:'stealth-rock',t:'rock',c:'status',p:0},
            {n:'wide-guard',t:'rock',c:'status',p:0}
        ],
        ghost: [
            {n:'shadow-ball',t:'ghost',c:'special',p:80},{n:'shadow-claw',t:'ghost',c:'physical',p:70},{n:'shadow-punch',t:'ghost',c:'physical',p:60},
            {n:'hex',t:'ghost',c:'special',p:65},{n:'phantom-force',t:'ghost',c:'physical',p:90},{n:'shadow-sneak',t:'ghost',c:'physical',p:40},
            {n:'night-shade',t:'ghost',c:'special',p:0},{n:'ominous-wind',t:'ghost',c:'special',p:60},{n:'spirit-shackle',t:'ghost',c:'physical',p:80},
            {n:'poltergeist',t:'ghost',c:'physical',p:110},{n:'shadow-force',t:'ghost',c:'physical',p:120},{n:'moongeist-beam',t:'ghost',c:'special',p:100},
            {n:'spectral-thief',t:'ghost',c:'physical',p:90},{n:'astral-barrage',t:'ghost',c:'special',p:120},{n:'lick',t:'ghost',c:'physical',p:30},
            {n:'confuse-ray',t:'ghost',c:'status',p:0},{n:'curse',t:'ghost',c:'status',p:0},{n:'destiny-bond',t:'ghost',c:'status',p:0},
            {n:'grudge',t:'ghost',c:'status',p:0},{n:'spite',t:'ghost',c:'status',p:0}
        ],
        dragon: [
            {n:'dragon-breath',t:'dragon',c:'special',p:60},{n:'dragon-claw',t:'dragon',c:'physical',p:80},{n:'dragon-pulse',t:'dragon',c:'special',p:85},
            {n:'outrage',t:'dragon',c:'physical',p:120},{n:'draco-meteor',t:'dragon',c:'special',p:130},{n:'dragon-rush',t:'dragon',c:'physical',p:100},
            {n:'dragon-tail',t:'dragon',c:'physical',p:60},{n:'twister',t:'dragon',c:'special',p:40},{n:'dragon-dance',t:'dragon',c:'status',p:0},
            {n:'scale-shot',t:'dragon',c:'physical',p:25},{n:'dual-chop',t:'dragon',c:'physical',p:40},{n:'dragon-hammer',t:'dragon',c:'physical',p:90},
            {n:'spacial-rend',t:'dragon',c:'special',p:100},{n:'roar-of-time',t:'dragon',c:'special',p:150},{n:'dragon-ascent',t:'dragon',c:'physical',p:120},
            {n:'core-enforcer',t:'dragon',c:'special',p:100},{n:'clanging-scales',t:'dragon',c:'special',p:110},{n:'dragon-darts',t:'dragon',c:'physical',p:50},
            {n:'dragon-energy',t:'dragon',c:'special',p:150}
        ],
        dark: [
            {n:'bite',t:'dark',c:'physical',p:60},{n:'crunch',t:'dark',c:'physical',p:80},{n:'dark-pulse',t:'dark',c:'special',p:80},
            {n:'sucker-punch',t:'dark',c:'physical',p:70},{n:'night-slash',t:'dark',c:'physical',p:70},{n:'foul-play',t:'dark',c:'physical',p:95},
            {n:'knock-off',t:'dark',c:'physical',p:65},{n:'pursuit',t:'dark',c:'physical',p:40},{n:'throat-chop',t:'dark',c:'physical',p:80},
            {n:'lash-out',t:'dark',c:'physical',p:75},{n:'assurance',t:'dark',c:'physical',p:60},{n:'payback',t:'dark',c:'physical',p:50},
            {n:'feint-attack',t:'dark',c:'physical',p:60},{n:'thief',t:'dark',c:'physical',p:60},{n:'snarl',t:'dark',c:'special',p:55},
            {n:'brutal-swing',t:'dark',c:'physical',p:60},{n:'darkest-lariat',t:'dark',c:'physical',p:85},{n:'fiery-wrath',t:'dark',c:'special',p:90},
            {n:'nasty-plot',t:'dark',c:'status',p:0},{n:'taunt',t:'dark',c:'status',p:0},{n:'torment',t:'dark',c:'status',p:0}
        ],
        steel: [
            {n:'metal-claw',t:'steel',c:'physical',p:50},{n:'iron-tail',t:'steel',c:'physical',p:100},{n:'flash-cannon',t:'steel',c:'special',p:80},
            {n:'steel-wing',t:'steel',c:'physical',p:70},{n:'iron-head',t:'steel',c:'physical',p:80},{n:'bullet-punch',t:'steel',c:'physical',p:40},
            {n:'meteor-mash',t:'steel',c:'physical',p:90},{n:'heavy-slam',t:'steel',c:'physical',p:0},{n:'smart-strike',t:'steel',c:'physical',p:70},
            {n:'steel-beam',t:'steel',c:'special',p:140},{n:'gyro-ball',t:'steel',c:'physical',p:0},{n:'magnet-bomb',t:'steel',c:'physical',p:60},
            {n:'mirror-shot',t:'steel',c:'special',p:65},{n:'doom-desire',t:'steel',c:'special',p:140},{n:'sunsteel-strike',t:'steel',c:'physical',p:100},
            {n:'anchor-shot',t:'steel',c:'physical',p:80},{n:'behemoth-blade',t:'steel',c:'physical',p:100},{n:'iron-defense',t:'steel',c:'status',p:0},
            {n:'autotomize',t:'steel',c:'status',p:0},{n:'metal-sound',t:'steel',c:'status',p:0}
        ],
        fairy: [
            {n:'fairy-wind',t:'fairy',c:'special',p:40},{n:'moonblast',t:'fairy',c:'special',p:95},{n:'dazzling-gleam',t:'fairy',c:'special',p:80},
            {n:'play-rough',t:'fairy',c:'physical',p:90},{n:'draining-kiss',t:'fairy',c:'special',p:50},{n:'disarming-voice',t:'fairy',c:'special',p:40},
            {n:'spirit-break',t:'fairy',c:'physical',p:75},{n:'fleur-cannon',t:'fairy',c:'special',p:130},{n:'strange-steam',t:'fairy',c:'special',p:90},
            {n:'nature-madness',t:'fairy',c:'special',p:0},{n:'charm',t:'fairy',c:'status',p:0},{n:'sweet-kiss',t:'fairy',c:'status',p:0},
            {n:'moonlight',t:'fairy',c:'status',p:0},{n:'misty-terrain',t:'fairy',c:'status',p:0},{n:'geomancy',t:'fairy',c:'status',p:0},
            {n:'baby-doll-eyes',t:'fairy',c:'status',p:0},{n:'aromatic-mist',t:'fairy',c:'status',p:0},{n:'decorate',t:'fairy',c:'status',p:0}
        ]
    };

    // Universal moves most Pokemon learn
    const universalMoves = [
        {n:'protect',t:'normal',c:'status',p:0},{n:'rest',t:'psychic',c:'status',p:0},
        {n:'sleep-talk',t:'normal',c:'status',p:0},{n:'substitute',t:'normal',c:'status',p:0},
        {n:'toxic',t:'poison',c:'status',p:0},{n:'hidden-power',t:'normal',c:'special',p:60},
        {n:'frustration',t:'normal',c:'physical',p:102},{n:'double-team',t:'normal',c:'status',p:0},
        {n:'attract',t:'normal',c:'status',p:0},{n:'endure',t:'normal',c:'status',p:0},
        {n:'swagger',t:'normal',c:'status',p:0},{n:'snore',t:'normal',c:'special',p:50},
        {n:'work-up',t:'normal',c:'status',p:0},{n:'confide',t:'normal',c:'status',p:0}
    ];

    let moves = [];
    types.forEach(t => {
        if (moveSets[t]) moves.push(...moveSets[t]);
    });
    // Add coverage moves from related types
    const coverageMap = {
        fire: ['ground','rock','fighting'],
        water: ['ice','ground','psychic'],
        grass: ['poison','ground','normal'],
        electric: ['ice','psychic','normal'],
        psychic: ['fairy','fighting','ghost'],
        dragon: ['fire','ice','ground'],
        dark: ['ghost','fighting','poison'],
        ghost: ['dark','psychic','poison'],
        fighting: ['rock','ground','dark'],
        bug: ['grass','flying','poison'],
        rock: ['ground','fighting','fire'],
        ground: ['rock','fighting','water'],
        flying: ['normal','fighting','ground'],
        ice: ['water','ground','psychic'],
        poison: ['ground','fighting','dark'],
        steel: ['rock','ground','fighting'],
        fairy: ['psychic','normal','fire'],
        normal: ['fighting','ground','rock']
    };
    types.forEach(t => {
        const coverage = coverageMap[t] || [];
        coverage.forEach(ct => {
            if (moveSets[ct]) moves.push(...moveSets[ct].slice(0, 5));
        });
    });
    moves.push(...universalMoves);
    // Deduplicate by name
    const seen = new Set();
    moves = moves.filter(m => { if (seen.has(m.n)) return false; seen.add(m.n); return true; });
    return moves.map(m => ({ move: { name: m.n, type: m.t, category: m.c, power: m.p } }));
}

async function getPokemon(idOrName) {
    // Try local data first
    const local = getLocalPokemon(idOrName);

    // If API is available, try to get richer data
    if (await testApiAvailability()) {
        try {
            const data = await fetchJSON(`${POKEAPI}/pokemon/${String(idOrName).toLowerCase()}`);
            return data;
        } catch {
            // API failed for this pokemon, use local
        }
    }

    if (local) return local;
    throw new Error(`Pokemon "${idOrName}" not found`);
}

async function getPokemonSpecies(idOrName) {
    const key = String(idOrName).toLowerCase();
    const id = parseInt(key) || (POKEMON_MAP[key] && POKEMON_MAP[key].id);

    if (await testApiAvailability()) {
        try {
            const data = await fetchJSON(`${POKEAPI}/pokemon-species/${key}`);
            return data;
        } catch {}
    }

    // Return local species data
    const p = POKEMON_BY_ID[id] || POKEMON_MAP[key];
    const flavor = p ? p.flavor_text : '';
    return {
        id: id || 0,
        name: p ? p.name : key,
        flavor_text_entries: [{ flavor_text: flavor, language: { name: 'en' } }],
        evolution_chain: null,
        genera: [{ genus: 'Pokemon', language: { name: 'en' } }]
    };
}

async function getEvolutionChain(url) {
    try {
        const data = await fetchJSON(url);
        return data;
    } catch {
        return null;
    }
}

function getLocalEvolutionChain(pokemonName) {
    return EVOLUTION_CHAINS[pokemonName] || null;
}

function flattenEvoChain(chain) {
    const evos = [];
    function walk(node) {
        const id = parseInt(node.species.url.split('/').filter(Boolean).pop());
        evos.push({ name: node.species.name, id });
        node.evolves_to.forEach(walk);
    }
    walk(chain);
    return evos;
}

async function getPokemonList(offset = 0, limit = 24) {
    if (await testApiAvailability()) {
        try {
            return await fetchJSON(`${POKEAPI}/pokemon?offset=${offset}&limit=${limit}`);
        } catch {}
    }

    // Use local data
    const allPokemon = Object.values(POKEMON_BY_ID).sort((a, b) => a.id - b.id);
    const slice = allPokemon.slice(offset, offset + limit);
    return {
        count: allPokemon.length,
        results: slice.map(p => ({ name: p.name, url: `${POKEAPI}/pokemon/${p.id}/` }))
    };
}

async function searchTCGCards(query) {
    try {
        const data = await fetchJSON(`${TCG_API}/cards?q=name:"${encodeURIComponent(query)}"&pageSize=20&orderBy=-set.releaseDate`);
        return data.data || [];
    } catch {
        return generateMockCards(query);
    }
}

function generateMockCards(query) {
    const sets = ['Base Set','Jungle','Fossil','Team Rocket','Neo Genesis','Expedition','Ruby & Sapphire','Diamond & Pearl','Black & White','XY','Sun & Moon','Sword & Shield','Scarlet & Violet','Prismatic Evolutions'];
    const rarities = ['Common','Uncommon','Rare','Rare Holo','Rare Holo EX','Rare Ultra','Secret Rare','Illustration Rare'];
    const name = query.charAt(0).toUpperCase() + query.slice(1);

    return Array.from({ length: 8 }, (_, i) => {
        const set = sets[Math.floor(Math.random() * sets.length)];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        const price = rarity.includes('Secret') || rarity.includes('Ultra') ?
            (Math.random() * 200 + 20).toFixed(2) :
            rarity.includes('Holo') ? (Math.random() * 50 + 5).toFixed(2) :
            (Math.random() * 10 + 0.5).toFixed(2);

        const pokemon = POKEMON_MAP[query.toLowerCase()];
        const id = pokemon ? pokemon.id : 25;

        return {
            name: `${name}${rarity.includes('EX') ? ' EX' : rarity.includes('Ultra') ? ' V' : ''}`,
            set: { name: set },
            rarity: rarity,
            images: { small: pokemonImageUrl(id) },
            cardmarket: { prices: { averageSellPrice: parseFloat(price) } }
        };
    });
}

function getPokemonCategory(id) {
    if (LEGENDARIES.includes(id)) return 'Legendary';
    if (MYTHICALS.includes(id)) return 'Mythical';
    if (ULTRA_BEASTS.includes(id)) return 'Ultra Beast';
    return 'Normal';
}

function getRegionForPokemon(id) {
    for (const region of REGIONS) {
        if (id >= region.range[0] && id <= region.range[1]) return region.name;
    }
    return 'Unknown';
}

function getWeaknesses(types) {
    const multipliers = {};
    ALL_TYPES.forEach(t => multipliers[t] = 1);

    types.forEach(defType => {
        ALL_TYPES.forEach(atkType => {
            const eff = TYPE_EFFECTIVENESS[atkType];
            if (eff && eff[defType] !== undefined) {
                multipliers[atkType] *= eff[defType];
            }
        });
    });

    return {
        weakTo: ALL_TYPES.filter(t => multipliers[t] > 1),
        resistantTo: ALL_TYPES.filter(t => multipliers[t] > 0 && multipliers[t] < 1),
        immuneTo: ALL_TYPES.filter(t => multipliers[t] === 0)
    };
}

function getDailyPokemonId() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const ids = Object.keys(POKEMON_BY_ID).map(Number);
    return ids[seed % ids.length];
}
