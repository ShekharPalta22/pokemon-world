/* ============================================
   POKEMON WORLD - Main Application Controller
   ============================================ */

let currentPage = 'home';
let pokedexOffset = 0;
let currentTypeFilter = 'all';
let regionPokemonOffset = 0;

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);

    initNavigation();
    initTheme();
    initChat();
    navigateTo('home');
});

/* === NAVIGATION === */
function initNavigation() {
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(el.dataset.page);
        });
    });

    const mobileBtn = document.getElementById('mobile-menu-btn');
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('open');
        document.getElementById('nav-links').classList.toggle('open');
    });

    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    });
}

function navigateTo(page) {
    currentPage = page;
    const main = document.getElementById('main-content');

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });

    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('mobile-menu-btn').classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (page) {
        case 'home':
            main.innerHTML = renderHome();
            loadFeaturedPokemon();
            break;
        case 'pokedex':
            main.innerHTML = renderPokedex();
            pokedexOffset = 0;
            loadPokedex();
            setupPokedexSearch();
            break;
        case 'cards':
            main.innerHTML = renderCardShop();
            setupCardSearch();
            break;
        case 'world':
            main.innerHTML = renderWorld();
            break;
        case 'trainer':
            main.innerHTML = renderTrainer();
            break;
        case 'news':
            main.innerHTML = renderNews();
            break;
        case 'daily':
            main.innerHTML = renderDaily();
            loadDailyPokemon();
            break;
        case 'games':
            main.innerHTML = renderGames();
            break;
        case 'adventure':
            main.innerHTML = renderAdventure();
            initAdventure();
            break;
    }
}

/* === THEME === */
function initTheme() {
    const saved = localStorage.getItem('pokemon-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('pokemon-theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    document.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* === POKEDEX === */
async function loadPokedex() {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = Array(12).fill('<div class="pokemon-card skeleton" style="height: 220px;"></div>').join('');

    try {
        const data = await getPokemonList(pokedexOffset, 24);
        grid.innerHTML = '';

        const pokemonPromises = data.results.map(async (p) => {
            const pokemon = await getPokemon(p.name);
            return pokemon;
        });

        const pokemons = await Promise.all(pokemonPromises);
        grid.innerHTML = pokemons.map(pokemon => {
            const types = pokemon.types.map(t => t.type.name);
            return renderPokemonCard(pokemon.id, pokemon.name, types);
        }).join('');

        renderPagination(data.count);
    } catch (err) {
        grid.innerHTML = `<div class="empty-state"><div class="icon">😢</div><h3>Failed to load Pokemon</h3><p>Please check your internet connection and try again.</p></div>`;
    }
}

function renderPagination(total) {
    const pages = Math.ceil(total / 24);
    const currentPageNum = Math.floor(pokedexOffset / 24) + 1;
    const maxVisible = 5;
    let start = Math.max(1, currentPageNum - 2);
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    let html = `<button class="page-btn" onclick="goToPage(${currentPageNum - 1})" ${currentPageNum === 1 ? 'disabled' : ''}>←</button>`;
    if (start > 1) html += `<button class="page-btn" onclick="goToPage(1)">1</button><span style="color: var(--text-muted);">...</span>`;
    for (let i = start; i <= end; i++) {
        html += `<button class="page-btn ${i === currentPageNum ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    if (end < pages) html += `<span style="color: var(--text-muted);">...</span><button class="page-btn" onclick="goToPage(${pages})">${pages}</button>`;
    html += `<button class="page-btn" onclick="goToPage(${currentPageNum + 1})" ${currentPageNum === pages ? 'disabled' : ''}>→</button>`;

    document.getElementById('pokedex-pagination').innerHTML = html;
}

function goToPage(page) {
    pokedexOffset = (page - 1) * 24;
    loadPokedex();
    document.querySelector('.section').scrollIntoView({ behavior: 'smooth' });
}

function setupPokedexSearch() {
    const input = document.getElementById('pokedex-search');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokedex();
    });
}

async function searchPokedex() {
    const query = document.getElementById('pokedex-search').value.trim();
    if (!query) { loadPokedex(); return; }

    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = '<div class="pokemon-card skeleton" style="height: 220px;"></div>';

    try {
        const pokemon = await getPokemon(query.toLowerCase());
        const types = pokemon.types.map(t => t.type.name);
        grid.innerHTML = renderPokemonCard(pokemon.id, pokemon.name, types);
        document.getElementById('pokedex-pagination').innerHTML = '';
    } catch {
        grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>Pokemon not found</h3><p>Try searching with a different name or Pokedex number.</p></div>`;
        document.getElementById('pokedex-pagination').innerHTML = '';
    }
}

async function filterByType(type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
    currentTypeFilter = type;

    if (type === 'all') { pokedexOffset = 0; loadPokedex(); return; }

    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = Array(8).fill('<div class="pokemon-card skeleton" style="height: 220px;"></div>').join('');

    // Try API first, fall back to local data
    let filtered = [];
    if (await testApiAvailability()) {
        try {
            const data = await fetchJSON(`${POKEAPI}/type/${type}`);
            const pokemons = data.pokemon.slice(0, 24);
            const details = await Promise.all(
                pokemons.map(p => getPokemon(p.pokemon.name).catch(() => null))
            );
            filtered = details.filter(Boolean);
        } catch {}
    }

    if (filtered.length === 0) {
        // Use local data
        filtered = Object.values(POKEMON_BY_ID)
            .filter(p => p.types.includes(type))
            .sort((a, b) => a.id - b.id)
            .slice(0, 24)
            .map(p => formatLocalPokemon(p));
    }

    grid.innerHTML = filtered.map(pokemon => {
        const types = pokemon.types.map(t => t.type ? t.type.name : t);
        return renderPokemonCard(pokemon.id, pokemon.name, types);
    }).join('');

    document.getElementById('pokedex-pagination').innerHTML = '';
}

/* === POKEMON DETAIL === */
async function showPokemonDetail(idOrName) {
    const main = document.getElementById('main-content');
    main.innerHTML = `<div class="pokemon-detail"><div class="empty-state"><div class="icon">⏳</div><h3>Loading Pokemon...</h3></div></div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const pokemon = await getPokemon(idOrName);
        const species = await getPokemonSpecies(pokemon.id);
        let evoData = null;
        if (species.evolution_chain) {
            try { evoData = await getEvolutionChain(species.evolution_chain.url); } catch {}
        }
        // Use local evolution chain as fallback
        const localEvos = getLocalEvolutionChain(pokemon.name);
        main.innerHTML = renderPokemonDetail(pokemon, species, evoData, localEvos);
    } catch {
        main.innerHTML = `<div class="pokemon-detail"><div class="empty-state"><div class="icon">😢</div><h3>Pokemon not found</h3><button class="btn btn-primary" onclick="navigateTo('pokedex')">Back to Pokedex</button></div></div>`;
    }
}

let isShiny = false;
function toggleShiny(id) {
    isShiny = !isShiny;
    const img = document.getElementById('detail-pokemon-img');
    const btn = document.getElementById('shiny-btn');
    img.src = isShiny ? pokemonShinyUrl(id) : pokemonImageUrl(id);
    img.onerror = function() { this.src = pokemonSpriteUrl(id); };
    btn.classList.toggle('active', isShiny);
}

let isDynamax = false;
function toggleDynamax() {
    isDynamax = !isDynamax;
    const container = document.getElementById('detail-image-container');
    const btn = document.getElementById('dynamax-btn');
    container.classList.toggle('dynamax-active', isDynamax);
    btn.classList.toggle('active', isDynamax);
    btn.textContent = isDynamax ? '🔴 Dynamaxed!' : '🔴 Dynamax';
}

/* === FEATURED POKEMON (Home) === */
async function loadFeaturedPokemon() {
    const featured = [25, 6, 150, 149, 143, 130, 94, 131, 133, 248, 384, 445];
    const grid = document.getElementById('featured-grid');

    try {
        const pokemons = await Promise.all(featured.map(id => getPokemon(id)));
        grid.innerHTML = pokemons.map(pokemon => {
            const types = pokemon.types.map(t => t.type.name);
            return renderPokemonCard(pokemon.id, pokemon.name, types);
        }).join('');
    } catch {
        grid.innerHTML = '<div class="empty-state"><h3>Failed to load featured Pokemon</h3></div>';
    }
}

/* === HERO SEARCH === */
function handleHeroSearch() {
    const query = document.getElementById('hero-search-input').value.trim();
    if (!query) return;
    navigateTo('pokedex');
    setTimeout(() => {
        document.getElementById('pokedex-search').value = query;
        searchPokedex();
    }, 100);
}

document.addEventListener('keypress', (e) => {
    if (e.target.id === 'hero-search-input' && e.key === 'Enter') handleHeroSearch();
});

/* === CARD SHOP === */
function setupCardSearch() {
    document.getElementById('card-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCards();
    });
}

async function searchCards() {
    const query = document.getElementById('card-search').value.trim();
    if (!query) return;

    const results = document.getElementById('card-results');
    results.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Searching for cards...</p></div>';

    try {
        const cards = await searchTCGCards(query);
        if (cards.length === 0) {
            results.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>No cards found</h3><p>Try a different search term.</p></div>`;
            return;
        }

        results.innerHTML = `
            <h3 style="margin-bottom: 16px;">Found ${cards.length} cards</h3>
            <div class="tcg-grid">
                ${cards.map(card => `
                    <div class="tcg-card">
                        <img src="${card.images?.small || ''}" alt="${card.name}" loading="lazy">
                        <div class="tcg-card-info">
                            <h3>${card.name}</h3>
                            <p class="rarity">${card.rarity || 'Unknown'} · ${card.set?.name || ''}</p>
                            <p class="price">${card.cardmarket?.prices?.averageSellPrice ? '$' + card.cardmarket.prices.averageSellPrice.toFixed(2) : card.tcgplayer?.prices?.holofoil?.market ? '$' + card.tcgplayer.prices.holofoil.market.toFixed(2) : 'Price N/A'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    } catch {
        results.innerHTML = `<div class="empty-state"><div class="icon">😢</div><h3>Search failed</h3><p>Please try again later.</p></div>`;
    }
}

/* === WORLD MAP - Region Detail === */
async function showRegionDetail(regionName) {
    const region = REGIONS.find(r => r.name === regionName);
    if (!region) return;

    const main = document.getElementById('main-content');
    main.innerHTML = renderRegionDetail(region);
    regionPokemonOffset = 0;
    loadRegionPokemon(region);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadRegionPokemon(region) {
    const grid = document.getElementById('region-pokemon-grid');
    grid.innerHTML = Array(8).fill('<div class="pokemon-card skeleton" style="height: 220px;"></div>').join('');

    const start = region.range[0] + regionPokemonOffset;
    const end = Math.min(start + 24, region.range[1] + 1);
    const ids = [];
    for (let i = start; i < end; i++) ids.push(i);

    try {
        const pokemons = await Promise.all(ids.map(id => getPokemon(id).catch(() => null)));
        grid.innerHTML = pokemons.filter(Boolean).map(pokemon => {
            const types = pokemon.types.map(t => t.type.name);
            return renderPokemonCard(pokemon.id, pokemon.name, types);
        }).join('');

        const total = region.range[1] - region.range[0] + 1;
        const pages = Math.ceil(total / 24);
        const currentP = Math.floor(regionPokemonOffset / 24) + 1;

        if (pages > 1) {
            document.getElementById('region-pagination').innerHTML = `
                <button class="page-btn" onclick="regionPage(${currentP - 1}, '${region.name}')" ${currentP === 1 ? 'disabled' : ''}>←</button>
                ${Array.from({ length: Math.min(pages, 8) }, (_, i) => `
                    <button class="page-btn ${i + 1 === currentP ? 'active' : ''}" onclick="regionPage(${i + 1}, '${region.name}')">${i + 1}</button>
                `).join('')}
                <button class="page-btn" onclick="regionPage(${currentP + 1}, '${region.name}')" ${currentP === pages ? 'disabled' : ''}>→</button>`;
        }
    } catch {
        grid.innerHTML = '<div class="empty-state"><h3>Failed to load Pokemon</h3></div>';
    }
}

function regionPage(page, regionName) {
    const region = REGIONS.find(r => r.name === regionName);
    regionPokemonOffset = (page - 1) * 24;
    loadRegionPokemon(region);
}

function switchRegionTab(btn, tab, regionName) {
    const region = REGIONS.find(r => r.name === regionName);
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('region-tab-content');

    switch (tab) {
        case 'pokemon':
            content.innerHTML = `<div class="pokemon-grid" id="region-pokemon-grid"></div><div class="pagination" id="region-pagination"></div>`;
            regionPokemonOffset = 0;
            loadRegionPokemon(region);
            break;
        case 'gyms':
            content.innerHTML = `
                <div class="guide-grid">
                    ${region.gyms.map((g, i) => `
                        <div class="guide-card">
                            <div class="icon">🏟️</div>
                            <h3>Gym ${i + 1}</h3>
                            <p>${g}</p>
                        </div>
                    `).join('')}
                </div>`;
            break;
        case 'elite':
            content.innerHTML = `
                <div class="guide-grid">
                    ${region.eliteFour.map((e, i) => `
                        <div class="guide-card">
                            <div class="icon">${i === region.eliteFour.length - 1 ? '👑' : '⭐'}</div>
                            <h3>${e}</h3>
                            <p>Elite Four Member</p>
                        </div>
                    `).join('')}
                    <div class="guide-card" style="border-color: var(--accent-secondary);">
                        <div class="icon">🏆</div>
                        <h3>${region.champion}</h3>
                        <p>Champion</p>
                    </div>
                </div>`;
            break;
        case 'starters':
            content.innerHTML = `<div class="pokemon-grid" id="starters-grid"></div>`;
            loadStarterPokemon(region.starters);
            break;
        case 'legendaries':
            content.innerHTML = `<div class="pokemon-grid" id="legends-grid"></div>`;
            loadRegionLegendaries(region);
            break;
    }
}

async function loadStarterPokemon(starters) {
    const grid = document.getElementById('starters-grid');
    grid.innerHTML = '<div class="pokemon-card skeleton" style="height: 220px;"></div>'.repeat(3);

    try {
        const pokemons = await Promise.all(starters.map(name => getPokemon(name)));
        grid.innerHTML = pokemons.map(pokemon => {
            const types = pokemon.types.map(t => t.type.name);
            return renderPokemonCard(pokemon.id, pokemon.name, types);
        }).join('');
    } catch {
        grid.innerHTML = '<div class="empty-state"><h3>Failed to load</h3></div>';
    }
}

async function loadRegionLegendaries(region) {
    const grid = document.getElementById('legends-grid');
    const legendIds = LEGENDARIES.filter(id => id >= region.range[0] && id <= region.range[1]);
    const mythIds = MYTHICALS.filter(id => id >= region.range[0] && id <= region.range[1]);
    const allIds = [...legendIds, ...mythIds];

    if (allIds.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No Legendaries/Mythicals in this range</h3></div>';
        return;
    }

    grid.innerHTML = '<div class="pokemon-card skeleton" style="height: 220px;"></div>'.repeat(Math.min(allIds.length, 6));

    try {
        const pokemons = await Promise.all(allIds.map(id => getPokemon(id).catch(() => null)));
        grid.innerHTML = pokemons.filter(Boolean).map(pokemon => {
            const types = pokemon.types.map(t => t.type.name);
            return renderPokemonCard(pokemon.id, pokemon.name, types);
        }).join('');
    } catch {
        grid.innerHTML = '<div class="empty-state"><h3>Failed to load</h3></div>';
    }
}

/* === DAILY POKEMON === */
async function loadDailyPokemon() {
    const id = getDailyPokemonId();
    try {
        const pokemon = await getPokemon(id);
        const species = await getPokemonSpecies(id);
        document.getElementById('daily-showcase').innerHTML = renderDailyContent(pokemon, species);
    } catch {
        document.getElementById('daily-showcase').innerHTML = `<div class="empty-state"><div class="icon">😢</div><h3>Failed to load today's Pokemon</h3><p>Please try again later.</p></div>`;
    }
}
