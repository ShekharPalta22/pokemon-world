/* ============================================
   POKEMON WORLD - Games & Tools
   ============================================ */

/* === QUIZ === */
let quizState = { score: 0, current: 0, questions: [] };

const quizBank = [
    { q: 'What type is Pikachu?', options: ['Fire', 'Electric', 'Normal', 'Water'], answer: 1 },
    { q: 'Which Pokemon is #001 in the Pokedex?', options: ['Pikachu', 'Charmander', 'Bulbasaur', 'Mew'], answer: 2 },
    { q: 'What does Eevee evolve into with a Water Stone?', options: ['Jolteon', 'Flareon', 'Vaporeon', 'Espeon'], answer: 2 },
    { q: 'How many original Pokemon were there?', options: ['100', '150', '151', '152'], answer: 2 },
    { q: 'What type is strong against Dragon?', options: ['Fire', 'Fairy', 'Water', 'Psychic'], answer: 1 },
    { q: 'Which Pokemon is known as the "Genetic Pokemon"?', options: ['Mew', 'Mewtwo', 'Ditto', 'Deoxys'], answer: 1 },
    { q: 'What region is Pikachu from?', options: ['Johto', 'Hoenn', 'Kanto', 'Sinnoh'], answer: 2 },
    { q: 'Which starter Pokemon is a Water type in Gen 1?', options: ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu'], answer: 2 },
    { q: 'What is Charizard\'s secondary type?', options: ['Dragon', 'Flying', 'Fire', 'Normal'], answer: 1 },
    { q: 'Which Pokemon can Mega Evolve into two forms?', options: ['Charizard', 'Blaziken', 'Garchomp', 'Lucario'], answer: 0 },
    { q: 'What is the tallest Pokemon?', options: ['Wailord', 'Eternatus', 'Steelix', 'Rayquaza'], answer: 1 },
    { q: 'Which type has the most resistances?', options: ['Dragon', 'Steel', 'Fairy', 'Normal'], answer: 1 },
    { q: 'What level does Magikarp evolve?', options: ['Level 15', 'Level 20', 'Level 25', 'Level 30'], answer: 1 },
    { q: 'Who is the Champion of Sinnoh?', options: ['Steven', 'Lance', 'Cynthia', 'Leon'], answer: 2 },
    { q: 'What generation introduced Fairy type?', options: ['Gen 4', 'Gen 5', 'Gen 6', 'Gen 7'], answer: 2 },
    { q: 'Which Pokemon has the highest base stat total (non-mega)?', options: ['Mewtwo', 'Arceus', 'Eternatus', 'Rayquaza'], answer: 2 },
    { q: 'What does STAB stand for?', options: ['Special Type Attack Boost', 'Same Type Attack Bonus', 'Strong Type Ability Bonus', 'Status Type Attack Bonus'], answer: 1 },
    { q: 'Which region features Island Trials?', options: ['Galar', 'Kalos', 'Alola', 'Paldea'], answer: 2 },
    { q: 'What is the rarest type combination?', options: ['Ice/Poison', 'Normal/Ghost', 'Fire/Fairy', 'Bug/Dragon'], answer: 0 },
    { q: 'How many gym badges are in a typical Pokemon game?', options: ['6', '7', '8', '10'], answer: 2 }
];

function startQuiz() {
    quizState = { score: 0, current: 0, questions: shuffleArray([...quizBank]).slice(0, 10) };
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const area = document.getElementById('game-area');
    if (quizState.current >= quizState.questions.length) {
        area.innerHTML = `
            <div class="quiz-container page-enter">
                <div style="text-align: center; font-size: 4rem; margin-bottom: 20px;">🏆</div>
                <h2 style="text-align: center; margin-bottom: 12px;">Quiz Complete!</h2>
                <div class="quiz-score">You scored <strong>${quizState.score}</strong> out of <strong>${quizState.questions.length}</strong>!</div>
                <p style="text-align: center; margin-top: 16px; color: var(--text-secondary);">
                    ${quizState.score === quizState.questions.length ? '🌟 Perfect score! You\'re a Pokemon Master!' :
                      quizState.score >= 7 ? '🎉 Great job, trainer!' :
                      quizState.score >= 5 ? '👍 Not bad! Keep studying!' : '📚 Keep learning, trainer!'}
                </p>
                <div style="text-align: center; margin-top: 24px;">
                    <button class="btn btn-primary" onclick="startQuiz()">Play Again</button>
                </div>
            </div>`;
        return;
    }
    const q = quizState.questions[quizState.current];
    area.innerHTML = `
        <div class="quiz-container page-enter">
            <div class="quiz-score">Question ${quizState.current + 1} of ${quizState.questions.length} · Score: ${quizState.score}</div>
            <div class="quiz-question">${q.q}</div>
            <div class="quiz-options">
                ${q.options.map((opt, i) => `
                    <button class="quiz-option" onclick="answerQuiz(${i}, ${q.answer})">${opt}</button>
                `).join('')}
            </div>
        </div>`;
}

function answerQuiz(selected, correct) {
    const buttons = document.querySelectorAll('.quiz-option');
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
        if (i === correct) btn.classList.add('correct');
        if (i === selected && selected !== correct) btn.classList.add('wrong');
    });
    if (selected === correct) quizState.score++;
    quizState.current++;
    setTimeout(renderQuizQuestion, 1200);
}

/* === WHO'S THAT POKEMON === */
let wtpState = { pokemon: null, revealed: false };

async function startWTP() {
    const area = document.getElementById('game-area');
    area.innerHTML = `<div class="wtp-container page-enter"><div class="empty-state"><div class="icon">⏳</div><h3>Loading...</h3></div></div>`;

    const id = Math.floor(Math.random() * 898) + 1;
    try {
        const pokemon = await getPokemon(id);
        wtpState = { pokemon, revealed: false };

        area.innerHTML = `
            <div class="wtp-container page-enter">
                <h2 style="margin-bottom: 24px;">Who's That Pokemon?</h2>
                <div class="wtp-image">
                    <img id="wtp-img" class="silhouette" src="${pokemonImageUrl(id)}" alt="???" onerror="this.src='${pokemonSpriteUrl(id)}'">
                </div>
                <div class="wtp-input">
                    <input type="text" id="wtp-answer" placeholder="Type your guess..." autocomplete="off" onkeypress="if(event.key==='Enter')checkWTP()">
                    <button onclick="checkWTP()">Guess!</button>
                </div>
                <div id="wtp-result" style="margin-top: 20px;"></div>
                <div style="margin-top: 16px;">
                    <button class="btn btn-secondary" onclick="revealWTP()">Give Up</button>
                </div>
            </div>`;
    } catch {
        area.innerHTML = `<div class="empty-state"><h3>Failed to load. Try again!</h3><button class="btn btn-primary" onclick="startWTP()">Retry</button></div>`;
    }
}

function checkWTP() {
    if (wtpState.revealed) return;
    const answer = document.getElementById('wtp-answer').value.trim().toLowerCase();
    const result = document.getElementById('wtp-result');
    if (answer === wtpState.pokemon.name) {
        wtpState.revealed = true;
        document.getElementById('wtp-img').classList.remove('silhouette');
        result.innerHTML = `<p style="color: var(--accent-green); font-size: 1.2rem; font-weight: 700;">✅ Correct! It's ${wtpState.pokemon.name.charAt(0).toUpperCase() + wtpState.pokemon.name.slice(1)}!</p>
            <button class="btn btn-primary" style="margin-top: 12px;" onclick="startWTP()">Next Pokemon</button>`;
    } else {
        result.innerHTML = `<p style="color: var(--accent-primary);">❌ Not quite! Try again!</p>`;
    }
}

function revealWTP() {
    if (wtpState.revealed) return;
    wtpState.revealed = true;
    document.getElementById('wtp-img').classList.remove('silhouette');
    document.getElementById('wtp-result').innerHTML = `
        <p style="font-size: 1.2rem; font-weight: 700;">It's ${wtpState.pokemon.name.charAt(0).toUpperCase() + wtpState.pokemon.name.slice(1)}!</p>
        <button class="btn btn-primary" style="margin-top: 12px;" onclick="startWTP()">Next Pokemon</button>`;
}

/* === TEAM BUILDER === */
let team = JSON.parse(localStorage.getItem('pokemon-team') || '[]');

function startTeamBuilder() {
    const area = document.getElementById('game-area');
    area.innerHTML = `
        <div class="team-builder page-enter">
            <h2 style="text-align: center; margin-bottom: 24px;">👥 Team Builder</h2>
            <div class="team-slots" id="team-slots">
                ${renderTeamSlots()}
            </div>
            <div class="search-bar" style="max-width: 500px;">
                <input type="text" id="team-search" placeholder="Search Pokemon to add..." autocomplete="off">
                <button onclick="searchTeamPokemon()">Add</button>
            </div>
            <div id="team-search-results" style="margin-top: 16px;"></div>
            <div id="team-analysis" style="margin-top: 24px;">${renderTeamAnalysis()}</div>
        </div>`;
    document.getElementById('team-search').addEventListener('keypress', e => {
        if (e.key === 'Enter') searchTeamPokemon();
    });
}

function renderTeamSlots() {
    let html = '';
    for (let i = 0; i < 6; i++) {
        if (team[i]) {
            html += `
                <div class="team-slot filled" onclick="showPokemonDetail(${team[i].id})">
                    <img src="${pokemonSpriteUrl(team[i].id)}" alt="${team[i].name}">
                    <span class="slot-name">${team[i].name}</span>
                    <button class="remove-btn" onclick="event.stopPropagation(); removeFromTeam(${i})">&times;</button>
                </div>`;
        } else {
            html += `<div class="team-slot"><span style="font-size: 1.5rem; color: var(--text-muted);">+</span></div>`;
        }
    }
    return html;
}

function renderTeamAnalysis() {
    if (team.length === 0) return '<p style="text-align: center; color: var(--text-muted);">Add Pokemon to see team analysis</p>';

    const allTypes = new Set();
    team.forEach(p => p.types.forEach(t => allTypes.add(t)));

    const coverageTypes = ALL_TYPES.filter(t => {
        return Array.from(allTypes).some(teamType => {
            const eff = TYPE_EFFECTIVENESS[teamType];
            return eff && eff[t] === 2;
        });
    });

    const uncovered = ALL_TYPES.filter(t => !coverageTypes.includes(t));

    return `
        <div class="card" style="padding: 20px;">
            <h3 style="margin-bottom: 12px;">Team Analysis</h3>
            <p style="margin-bottom: 8px;"><strong>Types covered:</strong> ${Array.from(allTypes).map(t => `<span class="type-badge type-${t}" style="font-size: 0.75rem; padding: 2px 8px;">${t}</span>`).join(' ')}</p>
            <p style="margin-bottom: 8px;"><strong>Super effective against:</strong> ${coverageTypes.length > 0 ? coverageTypes.map(t => `<span class="type-badge type-${t}" style="font-size: 0.75rem; padding: 2px 8px;">${t}</span>`).join(' ') : 'None'}</p>
            ${uncovered.length > 0 ? `<p><strong>Gaps in coverage:</strong> ${uncovered.map(t => `<span class="type-badge type-${t}" style="font-size: 0.75rem; padding: 2px 8px;">${t}</span>`).join(' ')}</p>` : '<p style="color: var(--accent-green); font-weight: 600;">Full type coverage! Great team!</p>'}
        </div>`;
}

async function searchTeamPokemon() {
    const query = document.getElementById('team-search').value.trim();
    if (!query) return;
    const results = document.getElementById('team-search-results');
    results.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Searching...</p>';

    try {
        const pokemon = await getPokemon(query.toLowerCase());
        const types = pokemon.types.map(t => t.type.name);
        results.innerHTML = `
            <div class="card" style="display: flex; align-items: center; gap: 16px; padding: 16px; cursor: pointer;" onclick="addToTeam(${pokemon.id}, '${pokemon.name}', ${JSON.stringify(types).replace(/"/g, '&quot;')})">
                <img src="${pokemonSpriteUrl(pokemon.id)}" style="width: 60px; height: 60px; image-rendering: pixelated;">
                <div>
                    <strong style="text-transform: capitalize;">${pokemon.name}</strong>
                    <div style="margin-top: 4px;">${types.map(t => `<span class="type-badge type-${t}" style="font-size: 0.75rem; padding: 2px 8px;">${t}</span>`).join(' ')}</div>
                </div>
                <span style="margin-left: auto; color: var(--accent-green); font-weight: 600;">+ Add</span>
            </div>`;
    } catch {
        results.innerHTML = '<p style="text-align: center; color: var(--accent-primary);">Pokemon not found. Try another name!</p>';
    }
}

function addToTeam(id, name, types) {
    if (team.length >= 6) {
        document.getElementById('team-search-results').innerHTML = '<p style="text-align: center; color: var(--accent-primary);">Team is full! Remove a Pokemon first.</p>';
        return;
    }
    team.push({ id, name, types });
    localStorage.setItem('pokemon-team', JSON.stringify(team));
    document.getElementById('team-slots').innerHTML = renderTeamSlots();
    document.getElementById('team-analysis').innerHTML = renderTeamAnalysis();
    document.getElementById('team-search-results').innerHTML = `<p style="text-align: center; color: var(--accent-green);">Added ${name} to your team!</p>`;
    document.getElementById('team-search').value = '';
}

function removeFromTeam(index) {
    team.splice(index, 1);
    localStorage.setItem('pokemon-team', JSON.stringify(team));
    document.getElementById('team-slots').innerHTML = renderTeamSlots();
    document.getElementById('team-analysis').innerHTML = renderTeamAnalysis();
}

/* === TYPE CALCULATOR === */
let selectedTypes = [];

function startTypeCalc() {
    selectedTypes = [];
    const area = document.getElementById('game-area');
    area.innerHTML = `
        <div class="type-calc page-enter">
            <h2 style="text-align: center; margin-bottom: 8px;">⚡ Type Calculator</h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">Select 1 or 2 types to see effectiveness</p>
            <div class="type-selector">
                ${ALL_TYPES.map(t => `
                    <button class="type-select-btn type-${t}" data-type="${t}" onclick="toggleTypeCalcType('${t}')">${t}</button>
                `).join('')}
            </div>
            <div id="type-calc-results"></div>
        </div>`;
}

function toggleTypeCalcType(type) {
    const idx = selectedTypes.indexOf(type);
    if (idx >= 0) {
        selectedTypes.splice(idx, 1);
    } else if (selectedTypes.length < 2) {
        selectedTypes.push(type);
    } else {
        selectedTypes.shift();
        selectedTypes.push(type);
    }

    document.querySelectorAll('.type-select-btn').forEach(btn => {
        btn.classList.toggle('selected', selectedTypes.includes(btn.dataset.type));
    });

    if (selectedTypes.length > 0) {
        const { weakTo, resistantTo, immuneTo } = getWeaknesses(selectedTypes);
        document.getElementById('type-calc-results').innerHTML = `
            <div class="effectiveness-results" style="margin-top: 24px;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <strong>Analyzing:</strong> ${selectedTypes.map(t => `<span class="type-badge type-${t}">${t}</span>`).join(' / ')}
                </div>
                ${weakTo.length ? `<div class="eff-category"><h3>🔴 Weak To (takes more damage)</h3><div class="eff-types">${weakTo.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div></div>` : ''}
                ${resistantTo.length ? `<div class="eff-category"><h3>🟢 Resistant To (takes less damage)</h3><div class="eff-types">${resistantTo.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div></div>` : ''}
                ${immuneTo.length ? `<div class="eff-category"><h3>⚪ Immune To (no damage)</h3><div class="eff-types">${immuneTo.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div></div>` : ''}
            </div>`;
    } else {
        document.getElementById('type-calc-results').innerHTML = '';
    }
}

/* === DAMAGE CALCULATOR === */
function startDamageCalc() {
    const area = document.getElementById('game-area');
    area.innerHTML = `
        <div class="type-calc page-enter">
            <h2 style="text-align: center; margin-bottom: 24px;">💥 Damage Calculator</h2>
            <div class="card" style="padding: 24px;">
                <div class="grid-2" style="gap: 16px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 6px;">Attacker's Stat (Atk/SpA)</label>
                        <input type="number" id="dmg-atk" value="100" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 6px;">Defender's Stat (Def/SpD)</label>
                        <input type="number" id="dmg-def" value="100" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 6px;">Move Power</label>
                        <input type="number" id="dmg-power" value="80" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 6px;">Attacker Level</label>
                        <input type="number" id="dmg-level" value="50" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 1rem;">
                    </div>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
                    <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="dmg-stab"> STAB (1.5x)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="dmg-se"> Super Effective (2x)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="dmg-nve"> Not Very Effective (0.5x)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="dmg-crit"> Critical Hit (1.5x)
                    </label>
                </div>
                <button class="btn btn-primary" onclick="calculateDamage()" style="width: 100%;">Calculate Damage</button>
                <div id="dmg-result" style="margin-top: 16px;"></div>
            </div>
        </div>`;
}

function calculateDamage() {
    const atk = parseInt(document.getElementById('dmg-atk').value) || 100;
    const def = parseInt(document.getElementById('dmg-def').value) || 100;
    const power = parseInt(document.getElementById('dmg-power').value) || 80;
    const level = parseInt(document.getElementById('dmg-level').value) || 50;
    const stab = document.getElementById('dmg-stab').checked ? 1.5 : 1;
    const se = document.getElementById('dmg-se').checked ? 2 : 1;
    const nve = document.getElementById('dmg-nve').checked ? 0.5 : 1;
    const crit = document.getElementById('dmg-crit').checked ? 1.5 : 1;

    const baseDmg = ((2 * level / 5 + 2) * power * atk / def) / 50 + 2;
    const minDmg = Math.floor(baseDmg * 0.85 * stab * se * nve * crit);
    const maxDmg = Math.floor(baseDmg * 1.0 * stab * se * nve * crit);

    document.getElementById('dmg-result').innerHTML = `
        <div style="text-align: center; padding: 20px; background: var(--bg-secondary); border-radius: 12px;">
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">Estimated Damage Range</p>
            <p style="font-size: 2rem; font-weight: 800; color: var(--accent-primary);">${minDmg} – ${maxDmg}</p>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
                Modifiers: ${stab > 1 ? 'STAB ' : ''}${se > 1 ? 'SE ' : ''}${nve < 1 ? 'NVE ' : ''}${crit > 1 ? 'Crit ' : ''}${stab === 1 && se === 1 && nve === 1 && crit === 1 ? 'None' : ''}
            </p>
        </div>`;
}

/* === FAVORITES === */
function startFavorites() {
    const favorites = JSON.parse(localStorage.getItem('pokemon-favorites') || '[]');
    const area = document.getElementById('game-area');

    if (favorites.length === 0) {
        area.innerHTML = `
            <div class="empty-state page-enter">
                <div class="icon">❤️</div>
                <h3>No Favorites Yet</h3>
                <p>Browse the Pokedex and click the heart icon to save your favorites!</p>
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="navigateTo('pokedex')">Go to Pokedex</button>
            </div>`;
        return;
    }

    area.innerHTML = `
        <div class="page-enter">
            <h2 style="text-align: center; margin-bottom: 24px;">❤️ Your Favorites (${favorites.length})</h2>
            <div class="pokemon-grid" id="favorites-grid"></div>
        </div>`;

    favorites.forEach(async (id) => {
        try {
            const pokemon = await getPokemon(id);
            const types = pokemon.types.map(t => t.type.name);
            document.getElementById('favorites-grid').innerHTML += renderPokemonCard(pokemon.id, pokemon.name, types);
        } catch {}
    });
}

/* === HELPERS === */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderPokemonCard(id, name, types) {
    return `
        <div class="pokemon-card animate-in" onclick="showPokemonDetail(${id})">
            <div class="pokemon-number">#${String(id).padStart(4, '0')}</div>
            <img src="${pokemonImageUrl(id)}" alt="${name}" loading="lazy" onerror="this.src='${pokemonSpriteUrl(id)}'">
            <div class="pokemon-name">${id >= 10000 ? '✨ ' : ''}${name}</div>
            <div class="types">
                ${types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
            </div>
        </div>`;
}

function showGuideDetail(title) {
    const guide = TRAINER_GUIDES.find(g => g.title === title);
    if (!guide) return;

    const content = getGuideContent(title);
    const area = document.getElementById('main-content');
    area.innerHTML = `
        <div class="section page-enter">
            <button class="back-btn" onclick="navigateTo('trainer')">← Back to Trainer Academy</button>
            <div class="section-header">
                <h1>${guide.icon} ${guide.title}</h1>
                <p>${guide.desc}</p>
            </div>
            <div class="card" style="max-width: 800px; margin: 0 auto; padding: 32px;">
                ${content}
            </div>
        </div>`;
}

function getGuideContent(title) {
    const guides = {
        'Battle Basics': `
            <h2>How Pokemon Battles Work</h2>
            <p>Pokemon battles are turn-based combat where trainers command their Pokemon to use moves. Each turn, both sides choose an action, and the faster Pokemon moves first.</p>
            <h3 style="margin-top: 20px;">Key Concepts</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>STAB</strong> - Same Type Attack Bonus: 1.5x damage when a Pokemon uses a move matching its type</li>
                <li><strong>Type Effectiveness</strong> - Some types deal 2x, 0.5x, or 0x damage against others</li>
                <li><strong>Priority Moves</strong> - Moves like Quick Attack always go first regardless of Speed</li>
                <li><strong>Physical vs Special</strong> - Physical moves use Attack/Defense; Special moves use Sp.Atk/Sp.Def</li>
                <li><strong>Status Moves</strong> - Moves that don't deal direct damage but affect stats, weather, or conditions</li>
            </ul>
            <h3 style="margin-top: 20px;">Battle Tips</h3>
            <ol style="padding-left: 20px;">
                <li>Always consider type matchups before attacking</li>
                <li>Switch Pokemon when at a type disadvantage</li>
                <li>Use status moves to set up sweepers</li>
                <li>Protect your win condition Pokemon</li>
                <li>Keep track of your opponent's team and moves</li>
            </ol>`,
        'Type Matchup Chart': '<p>Scroll down to see the full type matchup chart on the Trainer Academy page! It shows all 18 types and their interactions.</p>',
        'EV & IV Training': `
            <h2>Understanding IVs (Individual Values)</h2>
            <p>Every Pokemon has hidden IV stats (0-31) for each of the 6 stats. These are set when you encounter the Pokemon and cannot be changed. Higher IVs = higher stats.</p>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Perfect IVs</strong> - A value of 31 in a stat (called "Best" in-game)</li>
                <li><strong>Hyper Training</strong> - In newer games, you can max out IVs at level 100 using Bottle Caps</li>
                <li><strong>Breeding</strong> - Parents can pass down IVs, making breeding the classic way to get perfect Pokemon</li>
            </ul>
            <h2 style="margin-top:24px;">Understanding EVs (Effort Values)</h2>
            <p>EVs are gained through battling or items. Each Pokemon can earn up to 510 total EVs, with a max of 252 per stat. Every 4 EVs = +1 to that stat at level 100.</p>
            <h3 style="margin-top:16px;">Common EV Spreads</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Sweeper:</strong> 252 Atk or Sp.Atk / 252 Speed / 4 HP</li>
                <li><strong>Tank:</strong> 252 HP / 252 Def or Sp.Def / 4 Atk</li>
                <li><strong>Balanced:</strong> 128 HP / 128 Def / 252 Sp.Atk</li>
            </ul>
            <h3 style="margin-top:16px;">EV Training Methods</h3>
            <ol style="padding-left: 20px;">
                <li>Battle specific wild Pokemon that give the EVs you want</li>
                <li>Use vitamins (Protein, Iron, etc.) for +10 EVs each</li>
                <li>Use Power Items to double EV gains from battles</li>
                <li>Pokerus doubles all EV gains — very rare but spreadable</li>
            </ol>`,
        'Competitive Team Building': `
            <h2>Building a Winning Team</h2>
            <p>A strong competitive team needs balance, synergy, and a clear strategy. Here's how to build one.</p>
            <h3 style="margin-top:16px;">Team Roles</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Lead</strong> - Sets up entry hazards or disrupts the opponent early</li>
                <li><strong>Sweeper</strong> - High Attack or Sp.Atk + Speed to KO opponents</li>
                <li><strong>Wall/Tank</strong> - High defenses to absorb hits and stall</li>
                <li><strong>Pivot</strong> - Uses U-turn/Volt Switch to gain momentum</li>
                <li><strong>Support</strong> - Provides healing, screens, or status moves</li>
                <li><strong>Revenge Killer</strong> - Fast Pokemon or Choice Scarf user to pick off weakened foes</li>
            </ul>
            <h3 style="margin-top:16px;">Type Coverage</h3>
            <p>Your team should cover as many types as possible. A good rule: make sure at least one team member can hit every type super-effectively.</p>
            <h3 style="margin-top:16px;">Synergy Tips</h3>
            <ol style="padding-left: 20px;">
                <li>Pair Fire + Water + Grass cores for strong defensive coverage</li>
                <li>Use Dragon + Steel + Fairy for offensive pressure</li>
                <li>Have a spinner or Defog user to clear hazards</li>
                <li>Include at least one Ground-type to absorb Electric attacks</li>
                <li>Avoid stacking too many Pokemon weak to the same type</li>
            </ol>`,
        'Mega Evolution Guide': `
            <h2>What is Mega Evolution?</h2>
            <p>Mega Evolution is a temporary transformation during battle that boosts stats and sometimes changes typing. Only one Pokemon per team can Mega Evolve per battle.</p>
            <h3 style="margin-top:16px;">How It Works</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li>The Pokemon must hold its specific Mega Stone</li>
                <li>The trainer must have a Key Stone (Mega Ring/Bracelet)</li>
                <li>Mega Evolution happens at the start of the turn before attacking</li>
                <li>The Pokemon keeps its Mega form until it faints or the battle ends</li>
            </ul>
            <h3 style="margin-top:16px;">Top Mega Evolutions</h3>
            <ol style="padding-left: 20px;">
                <li><strong>Mega Rayquaza</strong> - Doesn't need a Mega Stone! Banned to Anything Goes tier</li>
                <li><strong>Mega Kangaskhan</strong> - Parental Bond hits twice per move</li>
                <li><strong>Mega Charizard X/Y</strong> - Two forms: Dragon/Fire (X) or boosted Sp.Atk (Y)</li>
                <li><strong>Mega Lucario</strong> - Adaptability + huge Attack and Sp.Atk</li>
                <li><strong>Mega Gengar</strong> - Shadow Tag traps opponents, massive Sp.Atk</li>
            </ol>`,
        'Z-Moves & Dynamax': `
            <h2>Z-Moves (Generation 7)</h2>
            <p>Z-Moves are powerful one-use attacks activated by Z-Crystals. Each type has its own Z-Crystal, and some Pokemon have exclusive Z-Moves.</p>
            <ul style="padding-left: 20px; list-style: disc;">
                <li>Z-Moves can only be used once per battle</li>
                <li>Damaging Z-Moves are based on the original move's power</li>
                <li>Status Z-Moves give bonus effects (stat boosts, heals)</li>
                <li>Cannot miss (unless the target is in a semi-invulnerable state)</li>
            </ul>
            <h2 style="margin-top:24px;">Dynamax & Gigantamax (Generation 8)</h2>
            <p>Dynamax makes a Pokemon giant for 3 turns, boosting HP and changing moves to Max Moves with bonus effects.</p>
            <h3 style="margin-top:16px;">Max Move Effects</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Max Airstream</strong> (Flying) - Boosts team Speed</li>
                <li><strong>Max Steelspike</strong> (Steel) - Boosts team Defense</li>
                <li><strong>Max Geyser</strong> (Water) - Sets Rain</li>
                <li><strong>Max Flare</strong> (Fire) - Sets Sun</li>
                <li><strong>Max Guard</strong> (Status) - Protects from all moves</li>
            </ul>
            <p style="margin-top:12px;"><strong>Gigantamax</strong> Pokemon have unique G-Max moves with special effects instead of standard Max Moves.</p>`,
        'TCG Deck Building': `
            <h2>Building Your First Deck</h2>
            <p>A standard Pokemon TCG deck has exactly 60 cards. Here's the basic formula for a balanced deck.</p>
            <h3 style="margin-top:16px;">Card Ratios</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Pokemon:</strong> 12-20 cards (your attackers and support)</li>
                <li><strong>Trainer Cards:</strong> 25-35 cards (Items, Supporters, Stadiums)</li>
                <li><strong>Energy:</strong> 10-15 cards (to power your attacks)</li>
            </ul>
            <h3 style="margin-top:16px;">Key Principles</h3>
            <ol style="padding-left: 20px;">
                <li>Focus on 1-2 main attackers, not too many evolution lines</li>
                <li>Include 4 copies of your most important cards</li>
                <li>Run draw supporters: Professor's Research, Boss's Orders</li>
                <li>Include search cards to find the Pokemon you need fast</li>
                <li>Have an energy acceleration strategy (attach extra energy)</li>
            </ol>
            <h3 style="margin-top:16px;">Beginner Tips</h3>
            <p>Start with a pre-built theme deck and modify it. Play test games to learn what works and what to cut. Focus on consistency over flashy combos.</p>`,
        'Tournament Preparation': `
            <h2>Getting Ready for Tournaments</h2>
            <p>Whether it's VGC (Video Game Championships) or TCG events, preparation is key to success.</p>
            <h3 style="margin-top:16px;">Before the Tournament</h3>
            <ol style="padding-left: 20px;">
                <li>Know the format rules (banned Pokemon, item clauses, best-of-3, timer)</li>
                <li>Study the metagame — what teams are popular and how to beat them</li>
                <li>Practice against real opponents online for at least 50+ games</li>
                <li>Prepare your team sheet and verify all moves/items are legal</li>
                <li>Have backup strategies for common matchups</li>
            </ol>
            <h3 style="margin-top:16px;">During the Tournament</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Team Preview</strong> - Analyze your opponent's 6 Pokemon before selecting your 4</li>
                <li><strong>Take Notes</strong> - Track opponent's moves, items, and EV spreads between rounds</li>
                <li><strong>Stay Calm</strong> - Don't tilt after bad luck; focus on playing optimally</li>
                <li><strong>Manage Time</strong> - Don't run the clock unnecessarily</li>
                <li><strong>Bring Snacks</strong> - Tournaments are long! Stay hydrated and fueled</li>
            </ul>`,
        'Tera Types & Terastallization': `
            <h2>Terastallization (Generation 9)</h2>
            <p>Terastallization changes a Pokemon's type to its Tera Type once per battle. This can completely shift matchups and strategy.</p>
            <h3 style="margin-top:16px;">How It Works</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li>Every Pokemon has a Tera Type (can be any of 18 types)</li>
                <li>Terastallizing changes the Pokemon to that type for the rest of the battle</li>
                <li>STAB applies to the new type; original STAB becomes 1.5x instead of normal</li>
                <li>Can only be used once per battle — timing is crucial</li>
            </ul>
            <h3 style="margin-top:16px;">Best Tera Strategies</h3>
            <ol style="padding-left: 20px;">
                <li><strong>Defensive Tera</strong> - Change type to resist a super-effective hit (e.g., Water Tera on a Fire-type)</li>
                <li><strong>Offensive Tera</strong> - Boost a coverage move with STAB (e.g., Ice Tera on a Dragon-type using Ice Beam)</li>
                <li><strong>Surprise Factor</strong> - Catch opponents off guard by removing a key weakness</li>
                <li><strong>Tera Blast</strong> - A move that changes type to match your Tera Type, great for coverage</li>
            </ol>`,
        'Double Battle Strategies': `
            <h2>Mastering Double Battles</h2>
            <p>Double battles (2v2) are the official VGC format. They play very differently from singles.</p>
            <h3 style="margin-top:16px;">Key Differences from Singles</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li>Speed control is king — Tailwind, Trick Room, Icy Wind, Thunder Wave</li>
                <li>Spread moves (Earthquake, Surf, Heat Wave) hit both opponents</li>
                <li>Protect is essential — block attacks while your partner attacks</li>
                <li>Redirection (Follow Me, Rage Powder) protects your partner</li>
                <li>Intimidate is much stronger when affecting two opponents</li>
            </ul>
            <h3 style="margin-top:16px;">Common Strategies</h3>
            <ol style="padding-left: 20px;">
                <li><strong>Trick Room</strong> - Make slow Pokemon move first for 5 turns</li>
                <li><strong>Rain/Sun Teams</strong> - Weather-based offense with Swift Swim/Chlorophyll</li>
                <li><strong>Goodstuffs</strong> - Individually strong Pokemon with good coverage</li>
                <li><strong>Hard Trick Room</strong> - Dedicated Trick Room setter + slow sweepers</li>
            </ol>
            <h3 style="margin-top:16px;">Positioning Tips</h3>
            <p>Always think about both slots. Which Pokemon threatens both opponents? Which needs Protect this turn? Should you switch to change the matchup?</p>`,
        'Held Items Guide': `
            <h2>Essential Held Items</h2>
            <p>The right held item can make or break a Pokemon. Here are the most important ones.</p>
            <h3 style="margin-top:16px;">Offensive Items</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Choice Band/Specs/Scarf</strong> - 1.5x Atk/Sp.Atk/Speed but locked into one move</li>
                <li><strong>Life Orb</strong> - 1.3x damage but lose 10% HP per attack</li>
                <li><strong>Focus Sash</strong> - Survive any one hit at 1 HP (from full HP only)</li>
                <li><strong>Expert Belt</strong> - 1.2x damage on super-effective hits, no drawback</li>
            </ul>
            <h3 style="margin-top:16px;">Defensive Items</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Leftovers</strong> - Heal 1/16 max HP each turn. Best on tanks and walls</li>
                <li><strong>Eviolite</strong> - 1.5x Def and Sp.Def on not-fully-evolved Pokemon</li>
                <li><strong>Assault Vest</strong> - 1.5x Sp.Def but can't use status moves</li>
                <li><strong>Rocky Helmet</strong> - Deals 1/6 HP damage to physical attackers on contact</li>
            </ul>
            <h3 style="margin-top:16px;">Utility Items</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Heavy-Duty Boots</strong> - Ignore entry hazards when switching in</li>
                <li><strong>Safety Goggles</strong> - Immune to weather damage and powder moves</li>
                <li><strong>Sitrus Berry</strong> - Heal 25% HP when below 50%. Great in doubles</li>
            </ul>`,
        'Status Effects & Moves': `
            <h2>Status Conditions</h2>
            <p>Status conditions are powerful tools that can swing battles. Here's every status and how it works.</p>
            <h3 style="margin-top:16px;">Major Status (only one at a time)</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Burn</strong> - 1/16 HP damage per turn, halves physical Attack. Best against physical attackers</li>
                <li><strong>Paralysis</strong> - 25% chance to skip a turn, Speed cut to 50%. Great for speed control</li>
                <li><strong>Poison</strong> - 1/8 HP damage per turn. Toxic increases each turn (1/16, 2/16, 3/16...)</li>
                <li><strong>Sleep</strong> - Cannot act for 1-3 turns. Very strong but hard to land reliably</li>
                <li><strong>Freeze</strong> - Cannot act until thawed (20% chance each turn). Rare but devastating</li>
            </ul>
            <h3 style="margin-top:16px;">Volatile Status (can stack)</h3>
            <ul style="padding-left: 20px; list-style: disc;">
                <li><strong>Confusion</strong> - 33% chance to hit yourself. Lasts 2-5 turns</li>
                <li><strong>Flinch</strong> - Skip your turn. Only works if the attacker moves first</li>
                <li><strong>Taunt</strong> - Can't use status moves for 3 turns. Shuts down walls</li>
                <li><strong>Encore</strong> - Locked into last move used for 3 turns</li>
            </ul>
            <h3 style="margin-top:16px;">Key Status Moves</h3>
            <ol style="padding-left: 20px;">
                <li>Will-O-Wisp (Burn), Thunder Wave (Paralysis), Toxic (Bad Poison)</li>
                <li>Spore (100% Sleep, Grass-types only), Yawn (Sleep next turn)</li>
                <li>Stealth Rock, Spikes, Toxic Spikes (entry hazards)</li>
                <li>Defog, Rapid Spin (hazard removal)</li>
            </ol>`,
    };
    return guides[title] || `<p>This guide is coming soon! In the meantime, ask our <strong>AI Chat Assistant</strong> about "${title}" for instant answers.</p><p style="margin-top: 12px;">Try clicking the chat button in the bottom right corner!</p>`;
}

function handleCardScan(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const resultArea = document.getElementById('card-results');
            resultArea.innerHTML = `
                <div class="card" style="max-width: 500px; margin: 0 auto; padding: 24px; text-align: center;">
                    <img src="${e.target.result}" style="max-width: 250px; border-radius: 12px; margin: 0 auto 16px;">
                    <h3>Card Detected!</h3>
                    <p style="color: var(--text-secondary); margin: 8px 0;">Our AI is analyzing your card...</p>
                    <div style="margin-top: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                        <p style="color: var(--accent-secondary); font-weight: 600;">📸 Card scanning feature</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">For accurate card identification and pricing, search for the card name above or ask our AI Chat assistant!</p>
                    </div>
                </div>`;
        };
        reader.readAsDataURL(file);
    }
}
