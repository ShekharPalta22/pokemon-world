/* ============================================
   POKEMON WORLD - Page Renderers
   ============================================ */

function renderHome() {
    return `
    <div class="hero">
        <div class="hero-content page-enter">
            <h1>Welcome to<br><span class="gradient-text">Pokemon World</span></h1>
            <p>The ultimate Pokemon hub for fans, collectors, and competitive players. Explore the Pokedex, check card prices, learn battle strategies, and more!</p>
            <div class="hero-search">
                <input type="text" id="hero-search-input" placeholder="Search any Pokemon by name or number..." autocomplete="off">
                <button onclick="handleHeroSearch()">Search</button>
            </div>
            <div class="hero-features">
                <div class="hero-feature" onclick="navigateTo('pokedex')">📖 Pokedex</div>
                <div class="hero-feature" onclick="navigateTo('cards')">🃏 Card Shop</div>
                <div class="hero-feature" onclick="navigateTo('world')">🗺️ World Map</div>
                <div class="hero-feature" onclick="navigateTo('trainer')">🎓 Trainer Academy</div>
                <div class="hero-feature" onclick="navigateTo('daily')">⭐ Daily Pokemon</div>
                <div class="hero-feature" onclick="navigateTo('games')">🎮 Games & Tools</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h1>Featured Pokemon</h1>
            <p>Popular Pokemon from across all regions</p>
        </div>
        <div class="pokemon-grid" id="featured-grid"></div>
    </div>

    <div class="section">
        <div class="section-header">
            <h1>Latest News</h1>
            <p>Stay updated with the Pokemon world</p>
        </div>
        <div class="news-grid">
            ${NEWS_DATA.slice(0, 3).map(n => `
                <div class="news-card animate-in">
                    <div class="news-image" style="background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));">${n.emoji}</div>
                    <div class="news-content">
                        <span class="news-tag">${n.tag}</span>
                        <h3>${n.title}</h3>
                        <p>${n.desc}</p>
                        <span class="news-date">${n.date}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function renderPokedex() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>📖 Pokedex</h1>
            <p>Search and explore every Pokemon</p>
        </div>
        <div class="search-bar">
            <input type="text" id="pokedex-search" placeholder="Search by name or number..." autocomplete="off">
            <button onclick="searchPokedex()">Search</button>
        </div>
        <div class="filter-bar" id="type-filters">
            <button class="filter-btn active" data-type="all" onclick="filterByType('all')">All</button>
            ${ALL_TYPES.map(t => `
                <button class="filter-btn" data-type="${t}" onclick="filterByType('${t}')" style="--filter-color: ${TYPE_COLORS[t]}">${t}</button>
            `).join('')}
        </div>
        <div class="pokemon-grid" id="pokedex-grid"></div>
        <div class="pagination" id="pokedex-pagination"></div>
    </div>
    `;
}

function renderPokemonDetail(pokemon, species, evoData, localEvos) {
    const types = pokemon.types.map(t => t.type.name);
    const category = getPokemonCategory(pokemon.id);
    const region = getRegionForPokemon(pokemon.id);
    const { weakTo, resistantTo, immuneTo } = getWeaknesses(types);
    const abilities = pokemon.abilities.map(a => a.ability.name.replace('-', ' '));
    const funFact = POKEMON_FUN_FACTS[pokemon.id] || `${pokemon.name} is Pokemon #${pokemon.id} in the National Pokedex.`;

    const flavorEntry = species.flavor_text_entries.find(e => e.language.name === 'en');
    const flavorText = flavorEntry ? flavorEntry.flavor_text.replace(/[\f\n]/g, ' ') : '';

    const evos = evoData ? flattenEvoChain(evoData.chain) : (localEvos || []);

    const statNames = { hp: 'HP', attack: 'Attack', defense: 'Defense', 'special-attack': 'Sp. Atk', 'special-defense': 'Sp. Def', speed: 'Speed' };

    let categoryBadge = '';
    if (category !== 'Normal') {
        const badgeClass = category === 'Legendary' ? 'badge-legendary' : category === 'Mythical' ? 'badge-mythical' : 'badge-ultra-beast';
        categoryBadge = `<span class="category-badge ${badgeClass}">${category}</span>`;
    }

    const allMoves = pokemon.moves.map(m => {
        const name = m.move.name.replace(/-/g, ' ');
        const moveType = m.move.type || null;
        const moveCat = m.move.category || null;
        const movePower = m.move.power || null;
        const dotColor = moveType && TYPE_COLORS[moveType] ? TYPE_COLORS[moveType] : 'var(--accent-blue)';
        const catIcon = moveCat === 'physical' ? '💥' : moveCat === 'special' ? '✨' : moveCat === 'status' ? '📊' : '';
        const powerText = movePower && movePower > 0 ? `<span style="color: var(--text-muted); font-size: 0.8rem; margin-left: auto;">${movePower}</span>` : moveCat === 'status' ? `<span style="color: var(--text-muted); font-size: 0.8rem; margin-left: auto;">—</span>` : '';
        return { html: `<div class="move-item" title="${moveType || ''} · ${moveCat || ''} · Power: ${movePower || '—'}"><span class="move-type-dot" style="background: ${dotColor}"></span><span>${catIcon} ${name}</span>${powerText}</div>`, type: moveType };
    });
    const movesHtml = allMoves.map(m => m.html).join('');

    return `
    <div class="pokemon-detail page-enter">
        <button class="back-btn" onclick="navigateTo('pokedex')">← Back to Pokedex</button>
        ${categoryBadge}
        <div class="detail-header">
            <div class="detail-image-container">
                <img id="detail-pokemon-img" src="${pokemonImageUrl(pokemon.id)}" alt="${pokemon.name}" onerror="this.src='${pokemonSpriteUrl(pokemon.id)}'">
                <button class="shiny-toggle" id="shiny-btn" onclick="toggleShiny(${pokemon.id})">✨ Shiny</button>
            </div>
            <div class="detail-info">
                <div class="pokemon-number">#${String(pokemon.id).padStart(4, '0')}</div>
                <h1>${pokemon.name}</h1>
                <div class="types">
                    ${types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-style: italic;">${flavorText}</p>
                <div class="info-grid">
                    <div class="info-item"><span class="label">Region</span><div class="value">${region}</div></div>
                    <div class="info-item"><span class="label">Category</span><div class="value">${category}</div></div>
                    <div class="info-item"><span class="label">Height</span><div class="value">${(pokemon.height / 10).toFixed(1)} m</div></div>
                    <div class="info-item"><span class="label">Weight</span><div class="value">${(pokemon.weight / 10).toFixed(1)} kg</div></div>
                    <div class="info-item"><span class="label">Base Exp</span><div class="value">${pokemon.base_experience || 'N/A'}</div></div>
                    <div class="info-item"><span class="label">Abilities</span><div class="value">${abilities.join(', ')}</div></div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h2>📊 Base Stats</h2>
            <div class="stats-grid">
                ${pokemon.stats.map(s => {
                    const val = s.base_stat;
                    const pct = Math.min((val / 255) * 100, 100);
                    const barClass = val >= 100 ? 'high' : val >= 60 ? 'medium' : 'low';
                    return `
                    <div class="stat-row">
                        <span class="stat-name">${statNames[s.stat.name] || s.stat.name}</span>
                        <span class="stat-value">${val}</span>
                        <div class="stat-bar-bg"><div class="stat-bar ${barClass}" style="width: ${pct}%"></div></div>
                    </div>`;
                }).join('')}
                <div class="stat-row">
                    <span class="stat-name" style="font-weight:700">Total</span>
                    <span class="stat-value" style="font-weight:700">${pokemon.stats.reduce((a, s) => a + s.base_stat, 0)}</span>
                    <div class="stat-bar-bg"><div class="stat-bar" style="width: ${Math.min(pokemon.stats.reduce((a, s) => a + s.base_stat, 0) / 720 * 100, 100)}%; background: var(--accent-purple);"></div></div>
                </div>
            </div>
        </div>

        ${evos.length > 1 ? `
        <div class="detail-section">
            <h2>🔄 Evolution Chain</h2>
            <div class="evolution-chain">
                ${evos.map((evo, i) => `
                    ${i > 0 ? '<span class="evo-arrow">→</span>' : ''}
                    <div class="evo-pokemon ${evo.id === pokemon.id ? 'current' : ''}" onclick="showPokemonDetail(${evo.id})" style="${evo.id === pokemon.id ? 'border: 2px solid var(--accent-primary);' : ''}">
                        <img src="${pokemonSpriteUrl(evo.id)}" alt="${evo.name}" onerror="this.style.display='none'">
                        <span class="name">${evo.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="detail-section">
            <h2>⚠️ Type Effectiveness</h2>
            <div class="effectiveness-results">
                ${weakTo.length ? `<div class="eff-category"><h3>🔴 Weak To</h3><div class="eff-types">${weakTo.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div></div>` : ''}
                ${resistantTo.length ? `<div class="eff-category"><h3>🟢 Resistant To</h3><div class="eff-types">${resistantTo.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div></div>` : ''}
                ${immuneTo.length ? `<div class="eff-category"><h3>⚪ Immune To</h3><div class="eff-types">${immuneTo.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div></div>` : ''}
            </div>
        </div>

        <div class="detail-section">
            <h2>💡 Fun Fact</h2>
            <div class="card" style="padding: 20px;">
                <p style="font-size: 1.05rem;">${funFact}</p>
            </div>
        </div>

        <div class="detail-section">
            <h2>⚡ All Moves (${pokemon.moves.length} total)</h2>
            <p style="color: var(--text-secondary); margin-bottom: 12px; font-size: 0.9rem;">💥 Physical &nbsp; ✨ Special &nbsp; 📊 Status &nbsp; · &nbsp; Number = Base Power</p>
            <div class="moves-grid">${movesHtml}</div>
        </div>
    </div>
    `;
}

function renderCardShop() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>🃏 Pokemon Card Shop</h1>
            <p>Search card prices, check values, and scan your cards</p>
        </div>

        <div class="scanner-area" onclick="document.getElementById('card-scan-input').click()">
            <div class="icon">📸</div>
            <h3>Scan a Pokemon Card</h3>
            <p>Upload a photo of your card to identify it and estimate its value</p>
            <input type="file" id="card-scan-input" accept="image/*" capture="environment" onchange="handleCardScan(this)">
            <label class="scanner-btn">Upload Card Photo</label>
        </div>

        <div class="search-bar">
            <input type="text" id="card-search" placeholder="Search for any Pokemon card..." autocomplete="off">
            <button onclick="searchCards()">Search</button>
        </div>
        <div id="card-results"></div>

        <div class="section-header" style="margin-top: 40px;">
            <h1>📍 Store Finder</h1>
            <p>Find Pokemon card stores near you</p>
        </div>
        <div class="store-grid">
            ${SAMPLE_STORES.map(s => `
                <div class="store-card">
                    <h3>🏪 ${s.name}</h3>
                    <div class="store-info">
                        <p>📍 ${s.address}</p>
                        <p>📞 ${s.phone}</p>
                        <p>🕐 ${s.hours}</p>
                        <p>📏 ${s.distance}</p>
                        <p><span class="store-rating">${'⭐'.repeat(Math.floor(s.rating))}</span> ${s.rating}/5</p>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function renderWorld() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>🗺️ Pokemon World</h1>
            <p>Explore every region in the Pokemon universe</p>
        </div>
        <div class="region-grid">
            ${REGIONS.map(r => `
                <div class="region-card" onclick="showRegionDetail('${r.name}')">
                    <div class="region-banner" style="background: linear-gradient(135deg, ${r.color}33, ${r.color}11);">${r.emoji}</div>
                    <div class="region-card-content">
                        <h3>${r.name}</h3>
                        <p>${r.desc}</p>
                        <div class="region-stats">
                            <span class="region-stat">Gen <strong>${r.gen}</strong></span>
                            <span class="region-stat"><strong>${r.range[1] - r.range[0] + 1}</strong> Pokemon</span>
                            <span class="region-stat">Starters: <strong>${r.starters.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</strong></span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function renderRegionDetail(region) {
    return `
    <div class="section page-enter">
        <button class="back-btn" onclick="navigateTo('world')">← Back to World Map</button>
        <div class="region-detail-header" style="background: linear-gradient(135deg, ${region.color}22, var(--bg-card));">
            <div style="font-size: 4rem; margin-bottom: 16px;">${region.emoji}</div>
            <h1>${region.name} Region</h1>
            <p>Generation ${region.gen} · Pokemon #${region.range[0]}–${region.range[1]}</p>
        </div>

        <div class="tab-bar">
            <button class="tab-btn active" onclick="switchRegionTab(this, 'pokemon', '${region.name}')">Pokemon</button>
            <button class="tab-btn" onclick="switchRegionTab(this, 'gyms', '${region.name}')">Gym Leaders</button>
            <button class="tab-btn" onclick="switchRegionTab(this, 'elite', '${region.name}')">Elite Four</button>
            <button class="tab-btn" onclick="switchRegionTab(this, 'starters', '${region.name}')">Starters</button>
            <button class="tab-btn" onclick="switchRegionTab(this, 'legendaries', '${region.name}')">Legendaries</button>
        </div>

        <div id="region-tab-content">
            <div class="pokemon-grid" id="region-pokemon-grid"></div>
            <div class="pagination" id="region-pagination"></div>
        </div>
    </div>
    `;
}

function renderTrainer() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>🎓 Trainer Academy</h1>
            <p>Learn everything about Pokemon battling, strategy, and competitive play</p>
        </div>
        <div class="guide-grid">
            ${TRAINER_GUIDES.map(g => {
                const diffClass = g.difficulty === 'Beginner' ? 'diff-beginner' : g.difficulty === 'Intermediate' ? 'diff-intermediate' : 'diff-advanced';
                return `
                <div class="guide-card" onclick="showGuideDetail('${g.title}')">
                    <div class="icon">${g.icon}</div>
                    <h3>${g.title}</h3>
                    <p>${g.desc}</p>
                    <span class="difficulty ${diffClass}">${g.difficulty}</span>
                </div>`;
            }).join('')}
        </div>

        <div class="section-header" style="margin-top: 60px;">
            <h1>📊 Type Matchup Chart</h1>
            <p>Master all 18 type matchups</p>
        </div>
        <div class="type-chart-container">
            <table class="type-chart">
                <tr>
                    <th>ATK ↓ / DEF →</th>
                    ${ALL_TYPES.map(t => `<th style="background: ${TYPE_COLORS[t]}; color: #fff;">${t.slice(0,3)}</th>`).join('')}
                </tr>
                ${ALL_TYPES.map(atkType => `
                    <tr>
                        <th style="background: ${TYPE_COLORS[atkType]}; color: #fff;">${atkType}</th>
                        ${ALL_TYPES.map(defType => {
                            const eff = TYPE_EFFECTIVENESS[atkType];
                            const val = eff && eff[defType] !== undefined ? eff[defType] : 1;
                            const cls = val === 2 ? 'super-effective' : val === 0.5 ? 'not-effective' : val === 0 ? 'no-effect' : '';
                            const text = val === 2 ? '2x' : val === 0.5 ? '½' : val === 0 ? '0' : '';
                            return `<td class="${cls}">${text}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </table>
        </div>
    </div>
    `;
}

function renderNews() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>📰 Pokemon Updates</h1>
            <p>Latest news from the Pokemon world</p>
        </div>
        <div class="news-grid">
            ${NEWS_DATA.map(n => `
                <div class="news-card animate-in">
                    <div class="news-image" style="background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));">${n.emoji}</div>
                    <div class="news-content">
                        <span class="news-tag">${n.tag}</span>
                        <h3>${n.title}</h3>
                        <p>${n.desc}</p>
                        <span class="news-date">${n.date}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function renderDaily() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>⭐ Pokemon of the Day</h1>
            <p>A new featured Pokemon every day!</p>
        </div>
        <div class="daily-showcase" id="daily-showcase">
            <div class="empty-state">
                <div class="icon">⏳</div>
                <h3>Loading today's Pokemon...</h3>
            </div>
        </div>
    </div>
    `;
}

function renderDailyContent(pokemon, species) {
    const types = pokemon.types.map(t => t.type.name);
    const category = getPokemonCategory(pokemon.id);
    const region = getRegionForPokemon(pokemon.id);
    const { weakTo } = getWeaknesses(types);
    const abilities = pokemon.abilities.map(a => a.ability.name.replace('-', ' '));
    const funFact = POKEMON_FUN_FACTS[pokemon.id] || `${pokemon.name} is a ${types.join('/')} type Pokemon from the ${region} region.`;
    const flavorEntry = species.flavor_text_entries.find(e => e.language.name === 'en');
    const flavorText = flavorEntry ? flavorEntry.flavor_text.replace(/[\f\n]/g, ' ') : '';
    const statNames = { hp: 'HP', attack: 'Attack', defense: 'Defense', 'special-attack': 'Sp. Atk', 'special-defense': 'Sp. Def', speed: 'Speed' };

    return `
    <div class="daily-image">
        <span class="daily-crown">👑</span>
        <img src="${pokemonImageUrl(pokemon.id)}" alt="${pokemon.name}" onerror="this.src='${pokemonSpriteUrl(pokemon.id)}'">
    </div>
    <h1 style="font-size: 2.5rem; font-weight: 800; text-transform: capitalize; margin-bottom: 8px;">${pokemon.name}</h1>
    <div class="pokemon-number">#${String(pokemon.id).padStart(4, '0')} · ${region}</div>
    ${category !== 'Normal' ? `<span class="category-badge badge-${category.toLowerCase().replace(' ', '-')}">${category}</span>` : ''}
    <div style="display: flex; gap: 8px; justify-content: center; margin: 16px 0;">
        ${types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
    </div>
    <p style="color: var(--text-secondary); font-style: italic; max-width: 500px; margin: 0 auto 24px;">${flavorText}</p>
    <div class="grid-2" style="max-width: 600px; margin: 0 auto 24px; text-align: left;">
        <div class="info-item"><span class="label">Height</span><div class="value">${(pokemon.height / 10).toFixed(1)} m</div></div>
        <div class="info-item"><span class="label">Weight</span><div class="value">${(pokemon.weight / 10).toFixed(1)} kg</div></div>
        <div class="info-item"><span class="label">Abilities</span><div class="value">${abilities.join(', ')}</div></div>
        <div class="info-item"><span class="label">Weak To</span><div class="value">${weakTo.slice(0, 4).join(', ')}</div></div>
    </div>
    <div style="text-align: left; max-width: 600px; margin: 0 auto 24px;">
        <h2 style="margin-bottom: 16px;">📊 Base Stats</h2>
        <div class="stats-grid">
            ${pokemon.stats.map(s => {
                const val = s.base_stat;
                const pct = Math.min((val / 255) * 100, 100);
                const barClass = val >= 100 ? 'high' : val >= 60 ? 'medium' : 'low';
                return `
                <div class="stat-row">
                    <span class="stat-name">${statNames[s.stat.name] || s.stat.name}</span>
                    <span class="stat-value">${val}</span>
                    <div class="stat-bar-bg"><div class="stat-bar ${barClass}" style="width: ${pct}%"></div></div>
                </div>`;
            }).join('')}
        </div>
    </div>
    <div class="card" style="max-width: 600px; margin: 0 auto; text-align: left;">
        <h3 style="margin-bottom: 8px;">💡 Fun Fact</h3>
        <p>${funFact}</p>
    </div>
    <div style="margin-top: 24px;">
        <button class="btn btn-primary" onclick="showPokemonDetail(${pokemon.id})">View Full Details →</button>
    </div>
    `;
}

function renderGames() {
    return `
    <div class="section">
        <div class="section-header page-enter">
            <h1>🎮 Games & Tools</h1>
            <p>Fun games and useful tools for every Pokemon trainer</p>
        </div>
        <div class="games-grid">
            <div class="game-card" onclick="startQuiz()">
                <div class="game-icon">🧠</div>
                <h3>Pokemon Quiz</h3>
                <p>Test your Pokemon knowledge with trivia questions!</p>
            </div>
            <div class="game-card" onclick="startWTP()">
                <div class="game-icon">❓</div>
                <h3>Who's That Pokemon?</h3>
                <p>Guess the Pokemon from its silhouette!</p>
            </div>
            <div class="game-card" onclick="startTeamBuilder()">
                <div class="game-icon">👥</div>
                <h3>Team Builder</h3>
                <p>Build your dream team of 6 Pokemon!</p>
            </div>
            <div class="game-card" onclick="startTypeCalc()">
                <div class="game-icon">⚡</div>
                <h3>Type Calculator</h3>
                <p>Check type effectiveness for any matchup!</p>
            </div>
            <div class="game-card" onclick="startDamageCalc()">
                <div class="game-icon">💥</div>
                <h3>Damage Calculator</h3>
                <p>Calculate battle damage with exact formulas!</p>
            </div>
            <div class="game-card" onclick="startFavorites()">
                <div class="game-icon">❤️</div>
                <h3>Favorites List</h3>
                <p>Save and manage your favorite Pokemon!</p>
            </div>
        </div>
        <div id="game-area" style="margin-top: 40px;"></div>
    </div>
    `;
}
