/* ============================================
   POKEMON WORLD - TCG Pocket Card Collector
   ============================================ */

const TCG_POCKET = {
    collection: [],
    coins: 0,
    packCost: 100,
    dailyClaimDate: null,

    RARITIES: [
        { name: 'Common', symbol: '◆', color: '#9ca3af', weight: 50 },
        { name: 'Uncommon', symbol: '◆◆', color: '#22c55e', weight: 25 },
        { name: 'Rare', symbol: '★', color: '#3b82f6', weight: 13 },
        { name: 'Holo Rare', symbol: '★H', color: '#a855f7', weight: 7 },
        { name: 'Ultra Rare', symbol: '★★', color: '#f59e0b', weight: 3.5 },
        { name: 'Secret Rare', symbol: '♛', color: '#ef4444', weight: 1.2 },
        { name: 'Crown Rare', symbol: '♛♛', color: '#ec4899', weight: 0.3 }
    ],

    PACK_TYPES: [
        { name: 'Kanto Pack', emoji: '🔴', color: '#ff4444', range: [1, 151], cost: 100 },
        { name: 'Johto Pack', emoji: '🌸', color: '#3b82f6', range: [152, 251], cost: 100 },
        { name: 'Starter Pack', emoji: '⭐', color: '#f59e0b', range: null, cost: 150 },
        { name: 'Legendary Pack', emoji: '👑', color: '#a855f7', range: null, cost: 300 }
    ],

    load() {
        const saved = localStorage.getItem('tcg_pocket_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.collection = data.collection || [];
            this.coins = typeof data.coins === 'number' ? data.coins : 500;
            this.dailyClaimDate = data.dailyClaimDate || null;
        } else {
            this.coins = 500;
            this.save();
        }
    },

    save() {
        localStorage.setItem('tcg_pocket_save', JSON.stringify({
            collection: this.collection,
            coins: this.coins,
            dailyClaimDate: this.dailyClaimDate
        }));
    },

    rollRarity() {
        const roll = Math.random() * 100;
        let cumulative = 0;
        for (const r of this.RARITIES) {
            cumulative += r.weight;
            if (roll < cumulative) return r;
        }
        return this.RARITIES[0];
    },

    getStarters() {
        const starterIds = [1,4,7,152,155,158,252,255,258,387,390,393,495,498,501,650,653,656,722,725,728,810,813,816,906,909,912];
        return starterIds.filter(id => POKEMON_BY_ID[id]);
    },

    getLegendaries() {
        const legendaryIds = [144,145,146,150,243,244,245,249,250,251,6,9,3,65,94,130,131,143,149,248];
        return legendaryIds.filter(id => POKEMON_BY_ID[id]);
    },

    getPokemonForPack(packType) {
        const keys = Object.keys(POKEMON_BY_ID);
        if (packType.name === 'Starter Pack') {
            const starters = this.getStarters();
            return starters[Math.floor(Math.random() * starters.length)];
        }
        if (packType.name === 'Legendary Pack') {
            const legs = this.getLegendaries();
            return legs[Math.floor(Math.random() * legs.length)];
        }
        if (packType.range) {
            const inRange = keys.filter(k => {
                const id = parseInt(k);
                return id >= packType.range[0] && id <= packType.range[1];
            });
            if (inRange.length) return parseInt(inRange[Math.floor(Math.random() * inRange.length)]);
        }
        return parseInt(keys[Math.floor(Math.random() * keys.length)]);
    },

    generateCard(packType) {
        const pokemonId = this.getPokemonForPack(packType);
        const pokemon = POKEMON_BY_ID[pokemonId];
        if (!pokemon) return null;
        const rarity = this.rollRarity();
        const isShiny = Math.random() < 0.02;
        const hp = pokemon.stats[0].base_stat;
        const atkPhys = pokemon.stats[1].base_stat;
        const atkSpec = pokemon.stats[3].base_stat;
        const defPhys = pokemon.stats[2].base_stat;
        const defSpec = pokemon.stats[4].base_stat;

        return {
            id: Date.now() + Math.random(),
            pokemonId: pokemon.id,
            name: pokemon.name,
            types: pokemon.types,
            hp,
            atk: Math.max(atkPhys, atkSpec),
            def: Math.max(defPhys, defSpec),
            rarity: rarity.name,
            raritySymbol: rarity.symbol,
            rarityColor: rarity.color,
            shiny: isShiny,
            obtained: new Date().toISOString()
        };
    },

    openPack(packIndex) {
        const pack = this.PACK_TYPES[packIndex];
        if (this.coins < pack.cost) return null;
        this.coins -= pack.cost;
        const cards = [];
        const count = pack.name === 'Legendary Pack' ? 3 : 5;
        for (let i = 0; i < count; i++) {
            const card = this.generateCard(pack);
            if (card) cards.push(card);
        }
        this.collection.push(...cards);
        this.save();
        return cards;
    },

    claimDaily() {
        const today = new Date().toDateString();
        if (this.dailyClaimDate === today) return false;
        this.dailyClaimDate = today;
        this.coins += 200;
        this.save();
        return true;
    },

    sellCard(cardId) {
        const idx = this.collection.findIndex(c => c.id === cardId);
        if (idx === -1) return 0;
        const card = this.collection[idx];
        const values = { 'Common': 10, 'Uncommon': 20, 'Rare': 40, 'Holo Rare': 80, 'Ultra Rare': 150, 'Secret Rare': 300, 'Crown Rare': 500 };
        const value = values[card.rarity] || 10;
        this.coins += value;
        this.collection.splice(idx, 1);
        this.save();
        return value;
    },

    getUniqueCount() {
        const unique = new Set(this.collection.map(c => c.pokemonId));
        return unique.size;
    },

    getCollectionByRarity() {
        const counts = {};
        for (const r of this.RARITIES) counts[r.name] = 0;
        for (const c of this.collection) counts[c.rarity] = (counts[c.rarity] || 0) + 1;
        return counts;
    },

    TRAINERS: [
        { name: 'Bug Catcher Tim', emoji: '🐛', difficulty: 'easy' },
        { name: 'Lass Sarah', emoji: '👧', difficulty: 'easy' },
        { name: 'Youngster Joey', emoji: '👦', difficulty: 'easy' },
        { name: 'Hiker Marcus', emoji: '🧗', difficulty: 'medium' },
        { name: 'Ace Trainer Lily', emoji: '🎯', difficulty: 'medium' },
        { name: 'Swimmer Dave', emoji: '🏊', difficulty: 'medium' },
        { name: 'Gym Leader Brock', emoji: '🏟️', difficulty: 'hard' },
        { name: 'Gym Leader Misty', emoji: '💧', difficulty: 'hard' },
        { name: 'Elite Four Lance', emoji: '🐉', difficulty: 'hard' },
        { name: 'Champion Red', emoji: '👑', difficulty: 'champion' }
    ],

    generateOpponentTeam(difficulty) {
        const keys = Object.keys(POKEMON_BY_ID);
        const team = [];
        const statMultiplier = { easy: 0.6, medium: 0.85, hard: 1.0, champion: 1.2 };
        const mult = statMultiplier[difficulty] || 0.8;

        for (let i = 0; i < 3; i++) {
            const pokemonId = parseInt(keys[Math.floor(Math.random() * keys.length)]);
            const pokemon = POKEMON_BY_ID[pokemonId];
            if (!pokemon) { i--; continue; }
            team.push({
                pokemonId: pokemon.id,
                name: pokemon.name,
                types: pokemon.types,
                hp: Math.round(pokemon.stats[0].base_stat * mult),
                maxHp: Math.round(pokemon.stats[0].base_stat * mult),
                atk: Math.round(Math.max(pokemon.stats[1].base_stat, pokemon.stats[3].base_stat) * mult),
                def: Math.round(Math.max(pokemon.stats[2].base_stat, pokemon.stats[4].base_stat) * mult)
            });
        }
        return team;
    },

    calcDamage(attacker, defender) {
        const base = Math.max(1, attacker.atk - Math.floor(defender.def * 0.5));
        const roll = 0.85 + Math.random() * 0.3;
        return Math.max(1, Math.round(base * roll));
    }
};

const TCG_UI = {
    currentView: 'menu',

    spriteUrl(id) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    },

    typeGradient(types) {
        const colors = { normal:'#a8a878', fire:'#f08030', water:'#6890f0', electric:'#f8d030', grass:'#78c850', ice:'#98d8d8', fighting:'#c03028', poison:'#a040a0', ground:'#e0c068', flying:'#a890f0', psychic:'#f85888', bug:'#a8b820', rock:'#b8a038', ghost:'#705898', dragon:'#7038f8', dark:'#705848', steel:'#b8b8d0', fairy:'#ee99ac' };
        const c1 = colors[types[0]] || '#888';
        const c2 = types[1] ? (colors[types[1]] || c1) : c1;
        return `linear-gradient(135deg, ${c1}, ${c2})`;
    },

    renderCardMini(card) {
        const shinyBadge = card.shiny ? '<span class="tcg-shiny-badge">✨</span>' : '';
        return `
            <div class="tcg-card-mini" style="border-color: ${card.rarityColor}" onclick="TCG_UI.showCardDetail('${card.id}')">
                <div class="tcg-card-art" style="background: ${this.typeGradient(card.types)}">
                    <img src="${this.spriteUrl(card.pokemonId)}" alt="${card.name}" loading="lazy">
                    ${shinyBadge}
                </div>
                <div class="tcg-card-info">
                    <span class="tcg-card-name">${card.name}</span>
                    <span class="tcg-card-rarity" style="color: ${card.rarityColor}">${card.raritySymbol}</span>
                </div>
            </div>`;
    },

    renderMenu() {
        this.currentView = 'menu';
        const today = new Date().toDateString();
        const canClaim = TCG_POCKET.dailyClaimDate !== today;
        const uniqueCount = TCG_POCKET.getUniqueCount();
        const totalPokemon = Object.keys(POKEMON_BY_ID).length;

        return `
            <div class="tcg-menu">
                <div class="tcg-stats-bar">
                    <div class="tcg-stat"><span class="tcg-stat-num">${TCG_POCKET.collection.length}</span><span class="tcg-stat-label">Cards</span></div>
                    <div class="tcg-stat"><span class="tcg-stat-num">${uniqueCount}</span><span class="tcg-stat-label">Unique</span></div>
                    <div class="tcg-stat"><span class="tcg-stat-num">${totalPokemon}</span><span class="tcg-stat-label">Total</span></div>
                </div>

                <div class="tcg-progress-wrap">
                    <div class="tcg-progress-bar"><div class="tcg-progress-fill" style="width: ${(uniqueCount/totalPokemon*100).toFixed(1)}%"></div></div>
                    <span class="tcg-progress-text">${(uniqueCount/totalPokemon*100).toFixed(1)}% Complete</span>
                </div>

                ${canClaim ? `<button class="tcg-btn tcg-btn-daily" onclick="TCG_UI.claimDaily()">🎁 Claim Daily Bonus — 200 coins!</button>` : `<div class="tcg-daily-claimed">✅ Daily bonus claimed! Come back tomorrow.</div>`}

                <button class="tcg-btn tcg-btn-primary" onclick="TCG_UI.showPackShop()">🎴 Open Packs</button>
                <button class="tcg-btn tcg-btn-battle" onclick="TCG_UI.showBattleSelect()">⚔️ Battle Trainers</button>
                <button class="tcg-btn tcg-btn-secondary" onclick="TCG_UI.showCollection()">📂 My Collection (${TCG_POCKET.collection.length})</button>
            </div>`;
    },

    renderPackShop() {
        this.currentView = 'shop';
        let html = `<div class="tcg-shop">
            <button class="tcg-back-btn" onclick="TCG_UI.goHome()">← Back</button>
            <h3 class="tcg-section-title">🎴 Pack Shop</h3>`;

        for (let i = 0; i < TCG_POCKET.PACK_TYPES.length; i++) {
            const pack = TCG_POCKET.PACK_TYPES[i];
            const canAfford = TCG_POCKET.coins >= pack.cost;
            const cardCount = pack.name === 'Legendary Pack' ? 3 : 5;
            html += `
                <div class="tcg-pack ${canAfford ? '' : 'tcg-pack-locked'}" onclick="${canAfford ? `TCG_UI.openPack(${i})` : ''}">
                    <div class="tcg-pack-art" style="background: ${pack.color}">
                        <span class="tcg-pack-emoji">${pack.emoji}</span>
                    </div>
                    <div class="tcg-pack-info">
                        <div class="tcg-pack-name">${pack.name}</div>
                        <div class="tcg-pack-desc">${cardCount} cards per pack</div>
                        <div class="tcg-pack-cost">${canAfford ? '' : '🔒 '}${pack.cost} coins</div>
                    </div>
                </div>`;
        }
        html += '</div>';
        return html;
    },

    renderCollection(filter) {
        this.currentView = 'collection';
        let cards = [...TCG_POCKET.collection];
        let filterLabel = 'All Cards';

        if (filter === 'shiny') { cards = cards.filter(c => c.shiny); filterLabel = 'Shiny Cards'; }
        else if (filter && filter !== 'all') { cards = cards.filter(c => c.rarity === filter); filterLabel = filter; }

        cards.sort((a, b) => a.pokemonId - b.pokemonId);

        const byCounts = TCG_POCKET.getCollectionByRarity();
        const shinyCount = TCG_POCKET.collection.filter(c => c.shiny).length;

        let html = `<div class="tcg-collection">
            <button class="tcg-back-btn" onclick="TCG_UI.goHome()">← Back</button>
            <h3 class="tcg-section-title">📂 ${filterLabel} (${cards.length})</h3>
            <div class="tcg-filter-bar">
                <button class="tcg-filter ${!filter || filter === 'all' ? 'active' : ''}" onclick="TCG_UI.showCollection()">All</button>`;

        for (const r of TCG_POCKET.RARITIES) {
            if (byCounts[r.name] > 0) {
                html += `<button class="tcg-filter" style="color:${r.color}" onclick="TCG_UI.showCollection('${r.name}')">${r.symbol} ${byCounts[r.name]}</button>`;
            }
        }
        if (shinyCount > 0) {
            html += `<button class="tcg-filter" onclick="TCG_UI.showCollection('shiny')">✨ ${shinyCount}</button>`;
        }

        html += '</div>';

        if (cards.length === 0) {
            html += '<div class="tcg-empty">No cards here yet! Open some packs to start collecting.</div>';
        } else {
            html += '<div class="tcg-card-grid">';
            for (const card of cards) html += this.renderCardMini(card);
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    renderReveal(cards) {
        this.currentView = 'reveal';
        let html = `<div class="tcg-reveal">
            <h3 class="tcg-section-title">🎉 You got ${cards.length} cards!</h3>
            <div class="tcg-reveal-cards">`;

        for (const card of cards) {
            const isNew = TCG_POCKET.collection.filter(c => c.pokemonId === card.pokemonId).length === 1;
            const shinyBadge = card.shiny ? '<div class="tcg-reveal-shiny">✨ SHINY!</div>' : '';
            const newBadge = isNew ? '<div class="tcg-reveal-new">NEW!</div>' : '';
            html += `
                <div class="tcg-reveal-card" style="border-color: ${card.rarityColor}">
                    <div class="tcg-reveal-art" style="background: ${this.typeGradient(card.types)}">
                        <img src="${this.spriteUrl(card.pokemonId)}" alt="${card.name}">
                        ${shinyBadge}
                        ${newBadge}
                    </div>
                    <div class="tcg-reveal-info">
                        <div class="tcg-reveal-name">${card.name}</div>
                        <div class="tcg-reveal-rarity" style="color: ${card.rarityColor}">${card.raritySymbol} ${card.rarity}</div>
                        <div class="tcg-reveal-stats">
                            <span>❤️${card.hp}</span>
                            <span>⚔️${card.atk}</span>
                            <span>🛡️${card.def}</span>
                        </div>
                    </div>
                </div>`;
        }

        html += `</div>
            <button class="tcg-btn tcg-btn-primary" onclick="TCG_UI.showPackShop()">Open More</button>
            <button class="tcg-btn tcg-btn-secondary" onclick="TCG_UI.goHome()">Back to Menu</button>
        </div>`;
        return html;
    },

    renderCardDetail(card) {
        this.currentView = 'detail';
        const pokemon = POKEMON_BY_ID[card.pokemonId];
        const flavor = pokemon ? pokemon.flavor_text : '';
        const sellValues = { 'Common': 10, 'Uncommon': 20, 'Rare': 40, 'Holo Rare': 80, 'Ultra Rare': 150, 'Secret Rare': 300, 'Crown Rare': 500 };
        const sellValue = sellValues[card.rarity] || 10;
        const dupeCount = TCG_POCKET.collection.filter(c => c.pokemonId === card.pokemonId).length;

        return `
            <div class="tcg-detail">
                <button class="tcg-back-btn" onclick="TCG_UI.showCollection()">← Back</button>
                <div class="tcg-detail-card" style="border-color: ${card.rarityColor}">
                    <div class="tcg-detail-art" style="background: ${this.typeGradient(card.types)}">
                        <img src="${this.spriteUrl(card.pokemonId)}" alt="${card.name}">
                        ${card.shiny ? '<div class="tcg-reveal-shiny">✨ SHINY</div>' : ''}
                    </div>
                    <h3 class="tcg-detail-name">${card.name} #${card.pokemonId}</h3>
                    <div class="tcg-detail-rarity" style="color: ${card.rarityColor}">${card.raritySymbol} ${card.rarity}</div>
                    <div class="tcg-detail-types">${card.types.map(t => `<span class="tcg-type-badge" style="background: ${TYPE_COLORS[t] || '#888'}">${t}</span>`).join('')}</div>
                    <div class="tcg-detail-stats">
                        <div class="tcg-detail-stat"><span class="tcg-detail-stat-val">❤️ ${card.hp}</span><span>HP</span></div>
                        <div class="tcg-detail-stat"><span class="tcg-detail-stat-val">⚔️ ${card.atk}</span><span>ATK</span></div>
                        <div class="tcg-detail-stat"><span class="tcg-detail-stat-val">🛡️ ${card.def}</span><span>DEF</span></div>
                    </div>
                    <p class="tcg-detail-flavor">${flavor}</p>
                    <div class="tcg-detail-meta">
                        <span>Copies owned: ${dupeCount}</span>
                    </div>
                </div>
                ${dupeCount > 1 ? `<button class="tcg-btn tcg-btn-sell" onclick="TCG_UI.sellCard('${card.id}')">💰 Sell for ${sellValue} coins</button>` : ''}
            </div>`;
    },

    update() {
        const el = document.getElementById('tcg-content');
        const coinsEl = document.getElementById('tcg-coins');
        if (!el) return;

        if (this.currentView === 'menu') el.innerHTML = this.renderMenu();
        else if (this.currentView === 'shop') el.innerHTML = this.renderPackShop();
        if (coinsEl) coinsEl.textContent = TCG_POCKET.coins + ' coins';
    },

    goHome() {
        const el = document.getElementById('tcg-content');
        if (el) el.innerHTML = this.renderMenu();
        this.updateCoins();
    },

    showPackShop() {
        const el = document.getElementById('tcg-content');
        if (el) el.innerHTML = this.renderPackShop();
        this.updateCoins();
    },

    showCollection(filter) {
        const el = document.getElementById('tcg-content');
        if (el) el.innerHTML = this.renderCollection(filter);
        this.updateCoins();
    },

    showCardDetail(cardId) {
        const card = TCG_POCKET.collection.find(c => String(c.id) === String(cardId));
        if (!card) return;
        const el = document.getElementById('tcg-content');
        if (el) el.innerHTML = this.renderCardDetail(card);
    },

    openPack(packIndex) {
        const cards = TCG_POCKET.openPack(packIndex);
        if (!cards) return;
        const el = document.getElementById('tcg-content');
        if (el) el.innerHTML = this.renderReveal(cards);
        this.updateCoins();
    },

    claimDaily() {
        if (TCG_POCKET.claimDaily()) {
            this.goHome();
        }
    },

    sellCard(cardId) {
        const value = TCG_POCKET.sellCard(parseFloat(cardId));
        if (value > 0) {
            this.showCollection();
        }
    },

    updateCoins() {
        const coinsEl = document.getElementById('tcg-coins');
        if (coinsEl) coinsEl.textContent = TCG_POCKET.coins + ' coins';
    },

    // === BATTLE SYSTEM ===
    battleState: null,
    selectedTeam: [],

    showBattleSelect() {
        if (TCG_POCKET.collection.length < 3) {
            const el = document.getElementById('tcg-content');
            el.innerHTML = `<div class="tcg-menu">
                <button class="tcg-back-btn" onclick="TCG_UI.goHome()">← Back</button>
                <div class="tcg-empty">You need at least <strong>3 cards</strong> to battle!<br><br>Open some packs first.</div>
                <button class="tcg-btn tcg-btn-primary" onclick="TCG_UI.showPackShop()">🎴 Open Packs</button>
            </div>`;
            return;
        }

        this.currentView = 'battle-select';
        this.selectedTeam = [];
        const el = document.getElementById('tcg-content');
        el.innerHTML = this.renderBattleSelect();
    },

    renderBattleSelect() {
        const cards = [...TCG_POCKET.collection].sort((a, b) => (b.atk + b.hp + b.def) - (a.atk + a.hp + a.def));

        let html = `<div class="tcg-battle-select">
            <button class="tcg-back-btn" onclick="TCG_UI.goHome()">← Back</button>
            <h3 class="tcg-section-title">⚔️ Pick 3 Cards to Battle</h3>
            <div class="tcg-team-selected" id="tcg-team-selected">
                <span class="tcg-team-count">${this.selectedTeam.length}/3 selected</span>
            </div>
            <div class="tcg-card-grid">`;

        for (const card of cards) {
            const selected = this.selectedTeam.find(c => c.id === card.id);
            html += `
                <div class="tcg-card-mini ${selected ? 'tcg-card-selected' : ''}" style="border-color: ${selected ? '#22c55e' : card.rarityColor}" onclick="TCG_UI.toggleBattleCard('${card.id}')">
                    <div class="tcg-card-art" style="background: ${this.typeGradient(card.types)}">
                        <img src="${this.spriteUrl(card.pokemonId)}" alt="${card.name}" loading="lazy">
                        ${selected ? '<div class="tcg-reveal-new">✔</div>' : ''}
                    </div>
                    <div class="tcg-card-info">
                        <span class="tcg-card-name">${card.name}</span>
                        <span class="tcg-card-rarity" style="color: ${card.rarityColor}">${card.raritySymbol}</span>
                    </div>
                </div>`;
        }

        html += `</div>`;
        if (this.selectedTeam.length === 3) {
            html += `<button class="tcg-btn tcg-btn-battle" onclick="TCG_UI.showTrainerSelect()" style="margin-top:10px">⚔️ Choose Opponent</button>`;
        }
        html += `</div>`;
        return html;
    },

    toggleBattleCard(cardId) {
        const idx = this.selectedTeam.findIndex(c => String(c.id) === String(cardId));
        if (idx !== -1) {
            this.selectedTeam.splice(idx, 1);
        } else if (this.selectedTeam.length < 3) {
            const card = TCG_POCKET.collection.find(c => String(c.id) === String(cardId));
            if (card) this.selectedTeam.push(card);
        }
        const el = document.getElementById('tcg-content');
        el.innerHTML = this.renderBattleSelect();
    },

    showTrainerSelect() {
        this.currentView = 'trainer-select';
        const el = document.getElementById('tcg-content');
        const rewards = { easy: 200, medium: 400, hard: 600, champion: 1000 };
        const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444', champion: '#a855f7' };

        let html = `<div class="tcg-shop">
            <button class="tcg-back-btn" onclick="TCG_UI.showBattleSelect()">← Back</button>
            <h3 class="tcg-section-title">⚔️ Choose Your Opponent</h3>`;

        for (let i = 0; i < TCG_POCKET.TRAINERS.length; i++) {
            const t = TCG_POCKET.TRAINERS[i];
            html += `
                <div class="tcg-pack" onclick="TCG_UI.startBattle(${i})">
                    <div class="tcg-pack-art" style="background: ${diffColors[t.difficulty]}">
                        <span class="tcg-pack-emoji">${t.emoji}</span>
                    </div>
                    <div class="tcg-pack-info">
                        <div class="tcg-pack-name">${t.name}</div>
                        <div class="tcg-pack-desc" style="text-transform:capitalize">${t.difficulty}</div>
                        <div class="tcg-pack-cost" style="color:${diffColors[t.difficulty]}">🏆 ${rewards[t.difficulty]} coins</div>
                    </div>
                </div>`;
        }
        html += '</div>';
        el.innerHTML = html;
    },

    startBattle(trainerIndex) {
        const trainer = TCG_POCKET.TRAINERS[trainerIndex];
        const opponentTeam = TCG_POCKET.generateOpponentTeam(trainer.difficulty);
        const playerTeam = this.selectedTeam.map(c => ({
            ...c,
            maxHp: c.hp,
            currentHp: c.hp
        }));
        opponentTeam.forEach(c => c.currentHp = c.hp);

        this.battleState = {
            trainer,
            playerTeam,
            opponentTeam,
            playerIndex: 0,
            opponentIndex: 0,
            log: [],
            turn: 'player',
            finished: false,
            won: false
        };

        this.battleState.log.push(`${trainer.emoji} ${trainer.name} wants to battle!`);
        this.renderBattle();
    },

    renderBattle() {
        this.currentView = 'battle';
        const el = document.getElementById('tcg-content');
        const s = this.battleState;
        const player = s.playerTeam[s.playerIndex];
        const opp = s.opponentTeam[s.opponentIndex];

        const hpBarPlayer = Math.max(0, (player.currentHp / player.maxHp) * 100);
        const hpBarOpp = Math.max(0, (opp.currentHp / opp.maxHp) * 100);
        const hpColorP = hpBarPlayer > 50 ? '#22c55e' : hpBarPlayer > 20 ? '#f59e0b' : '#ef4444';
        const hpColorO = hpBarOpp > 50 ? '#22c55e' : hpBarOpp > 20 ? '#f59e0b' : '#ef4444';

        const alivePlayer = s.playerTeam.filter(c => c.currentHp > 0).length;
        const aliveOpp = s.opponentTeam.filter(c => c.currentHp > 0).length;

        let html = `<div class="tcg-battle">
            <div class="tcg-battle-header">
                <span>⚔️ vs ${s.trainer.emoji} ${s.trainer.name}</span>
            </div>

            <div class="tcg-battle-field">
                <div class="tcg-battle-side tcg-battle-opponent">
                    <div class="tcg-battle-pokemon-art" style="background: ${this.typeGradient(opp.types)}">
                        <img src="${this.spriteUrl(opp.pokemonId)}" alt="${opp.name}">
                    </div>
                    <div class="tcg-battle-pokemon-info">
                        <span class="tcg-battle-pokemon-name">${opp.name}</span>
                        <div class="tcg-battle-hp-bar"><div class="tcg-battle-hp-fill" style="width:${hpBarOpp}%;background:${hpColorO}"></div></div>
                        <span class="tcg-battle-hp-text">${Math.max(0,opp.currentHp)}/${opp.maxHp || opp.hp}</span>
                    </div>
                    <span class="tcg-battle-alive">${aliveOpp}/3</span>
                </div>

                <div class="tcg-battle-vs">VS</div>

                <div class="tcg-battle-side tcg-battle-player">
                    <div class="tcg-battle-pokemon-art" style="background: ${this.typeGradient(player.types)}">
                        <img src="${this.spriteUrl(player.pokemonId)}" alt="${player.name}">
                    </div>
                    <div class="tcg-battle-pokemon-info">
                        <span class="tcg-battle-pokemon-name">${player.name}</span>
                        <div class="tcg-battle-hp-bar"><div class="tcg-battle-hp-fill" style="width:${hpBarPlayer}%;background:${hpColorP}"></div></div>
                        <span class="tcg-battle-hp-text">${Math.max(0,player.currentHp)}/${player.maxHp}</span>
                    </div>
                    <span class="tcg-battle-alive">${alivePlayer}/3</span>
                </div>
            </div>

            <div class="tcg-battle-log">
                ${s.log.slice(-3).map(l => `<div class="tcg-log-line">${l}</div>`).join('')}
            </div>`;

        if (s.finished) {
            const rewards = { easy: 200, medium: 400, hard: 600, champion: 1000 };
            const reward = rewards[s.trainer.difficulty];
            if (s.won) {
                html += `<div class="tcg-battle-result tcg-battle-win">🏆 YOU WIN! +${reward} coins!</div>`;
            } else {
                html += `<div class="tcg-battle-result tcg-battle-lose">💀 You lost... Better luck next time!</div>`;
            }
            html += `<button class="tcg-btn tcg-btn-battle" onclick="TCG_UI.showBattleSelect()" style="margin-top:8px">⚔️ Battle Again</button>
                     <button class="tcg-btn tcg-btn-secondary" onclick="TCG_UI.goHome()">Back to Menu</button>`;
        } else {
            html += `<button class="tcg-btn tcg-btn-battle" onclick="TCG_UI.doBattleTurn()">⚔️ Attack!</button>`;
        }

        html += `</div>`;
        el.innerHTML = html;
        this.updateCoins();
    },

    doBattleTurn() {
        const s = this.battleState;
        if (s.finished) return;

        const player = s.playerTeam[s.playerIndex];
        const opp = s.opponentTeam[s.opponentIndex];

        const playerDmg = TCG_POCKET.calcDamage(player, opp);
        opp.currentHp -= playerDmg;
        s.log.push(`⚔️ ${player.name} attacks for <strong>${playerDmg}</strong> damage!`);

        if (opp.currentHp <= 0) {
            opp.currentHp = 0;
            s.log.push(`💥 ${opp.name} fainted!`);
            const nextOpp = s.opponentTeam.findIndex((c, i) => i > s.opponentIndex && c.currentHp > 0);
            if (nextOpp === -1) {
                s.finished = true;
                s.won = true;
                const rewards = { easy: 200, medium: 400, hard: 600, champion: 1000 };
                TCG_POCKET.coins += rewards[s.trainer.difficulty];
                TCG_POCKET.save();
                s.log.push(`🏆 You defeated ${s.trainer.name}!`);
            } else {
                s.opponentIndex = nextOpp;
                s.log.push(`${s.trainer.emoji} sends out ${s.opponentTeam[nextOpp].name}!`);
            }
            this.renderBattle();
            return;
        }

        const oppDmg = TCG_POCKET.calcDamage(opp, player);
        player.currentHp -= oppDmg;
        s.log.push(`💢 ${opp.name} attacks for <strong>${oppDmg}</strong> damage!`);

        if (player.currentHp <= 0) {
            player.currentHp = 0;
            s.log.push(`💥 ${player.name} fainted!`);
            const nextPlayer = s.playerTeam.findIndex((c, i) => i > s.playerIndex && c.currentHp > 0);
            if (nextPlayer === -1) {
                s.finished = true;
                s.won = false;
                s.log.push(`💀 ${s.trainer.name} wins...`);
            } else {
                s.playerIndex = nextPlayer;
                s.log.push(`Go, ${s.playerTeam[nextPlayer].name}!`);
            }
        }

        this.renderBattle();
    }
};

/* ============================================
   PROFESSOR OAK AI
   ============================================ */

const OAK_AI = {
    greetings: [
        "Hello, trainer! How can I help you today?",
        "Welcome! Ask me anything about Pokemon!",
        "Hey there! Professor Oak here, ready to help!"
    ],

    async pokemonInfo(name) {
        try {
            const pokemon = await getPokemon(name.toLowerCase());
            const species = await getPokemonSpecies(pokemon.id);
            const types = pokemon.types.map(t => t.type.name);
            const category = getPokemonCategory(pokemon.id);
            const region = getRegionForPokemon(pokemon.id);
            const abilities = pokemon.abilities.map(a => a.ability.name.replace('-', ' '));
            const flavorEntry = species.flavor_text_entries
                ? species.flavor_text_entries.find(e => e.language.name === 'en')
                : null;
            const flavorText = flavorEntry ? flavorEntry.flavor_text.replace(/[\f\n]/g, ' ') : (species.flavor_text || '');
            const totalStats = pokemon.stats.reduce((a, s) => (s.base_stat || s.stat) ? a + (s.base_stat || 0) : a, 0);

            return `**${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}** (#${pokemon.id})\n\nType: ${types.join(', ')} | Region: ${region} | ${category}\nHeight: ${(pokemon.height/10).toFixed(1)}m | Weight: ${(pokemon.weight/10).toFixed(1)}kg\nAbilities: ${abilities.join(', ')}\nBase Stat Total: ${totalStats}\n\n${flavorText}`;
        } catch {
            return null;
        }
    },

    async getResponse(message) {
        const msg = message.toLowerCase().trim();

        if (msg.match(/^(hi|hello|hey|sup|yo|greetings)/)) {
            return this.greetings[Math.floor(Math.random() * this.greetings.length)];
        }

        if (msg.match(/how (are|r) (you|u)/)) {
            return "I'm doing great! Ready to help you with all things Pokemon! What would you like to know?";
        }

        if (msg.match(/strongest|most powerful|best pokemon/)) {
            if (msg.includes('kanto')) return "In Kanto, **Mewtwo** is the strongest with a base stat total of 680. For non-legendaries, **Dragonite** (600) is the top pick!";
            if (msg.includes('johto')) return "In Johto, **Ho-Oh** and **Lugia** lead with 680 base stats. **Tyranitar** (600) is the strongest non-legendary!";
            if (msg.includes('hoenn')) return "In Hoenn, **Rayquaza** reigns supreme with 680 base stats. **Salamence** and **Metagross** are excellent non-legendaries!";
            return "The strongest Pokemon by base stats are **Eternatus Eternamax** (1125), **Mega Mewtwo X/Y** (780), and **Mega Rayquaza** (780). For competitive play, it depends on the format!";
        }

        if (msg.match(/weakest|worst/)) {
            return "The weakest Pokemon by base stats are **Wishiwashi** (Solo Form, 175 BST), **Sunkern** (180 BST), and **Chansey** (base HP is amazing but 250 BST overall). Don't underestimate them though — some have unique strategies!";
        }

        if (msg.match(/card.*(worth|value|price|cost)|how much is/)) {
            const cardName = msg.replace(/how much is|worth|value|price|cost|card|a|the|of/g, '').trim();
            if (cardName) {
                return `For card prices, check the **Card Shop** page! Search for "${cardName}" there to see current market prices. Card values vary by edition, condition, and grading. Charizard cards, for example, range from $5 to $420,000+ for a PSA 10 1st Edition Base Set!`;
            }
            return "Check the **Card Shop** page to search for any card's current market price! Prices depend on edition, condition, and grading.";
        }

        if (msg.match(/build.*team|team.*build/)) {
            return "Great question! For team building:\n\n1. **Cover your types** — aim for at least 5 different types\n2. **Balance offense and defense** — mix sweepers and walls\n3. **Include a lead** — good entry hazards or speed\n4. **Have a win condition** — a setup sweeper or wallbreaker\n5. **Check synergy** — Fire/Water/Grass cores work great!\n\nTry the **Team Builder** in the Games section!";
        }

        if (msg.match(/deck|tcg.*build|card.*build/)) {
            return "For Pokemon TCG deck building:\n\n1. Start with 12-16 Pokemon cards\n2. Add 28-32 Trainer cards (Supporters, Items, Tools)\n3. Include 10-14 Energy cards\n4. Focus on 1-2 main attackers\n5. Include draw support (Professor's Research, Boss's Orders)\n\nCheck the **Trainer Academy** for detailed guides!";
        }

        if (msg.match(/type.*effective|super effective|weakness/)) {
            const typeMatch = msg.match(/(\w+)\s*(type|against|vs)/);
            if (typeMatch && ALL_TYPES && ALL_TYPES.includes(typeMatch[1])) {
                const type = typeMatch[1];
                const eff = TYPE_EFFECTIVENESS[type];
                if (eff) {
                    const superEff = Object.entries(eff).filter(([,v]) => v === 2).map(([k]) => k);
                    const notEff = Object.entries(eff).filter(([,v]) => v < 1 && v > 0).map(([k]) => k);
                    const noEffect = Object.entries(eff).filter(([,v]) => v === 0).map(([k]) => k);
                    return `**${type.charAt(0).toUpperCase() + type.slice(1)} type** attacks:\n\n🔴 Super effective vs: ${superEff.join(', ') || 'None'}\n🟡 Not very effective vs: ${notEff.join(', ') || 'None'}\n⚫ No effect vs: ${noEffect.join(', ') || 'None'}`;
                }
            }
            return "Ask me about a specific type! For example: 'fire type effective' or 'what is water weak against'. I know all 18 type matchups!";
        }

        if (msg.match(/ev train|iv|effort value|individual value/)) {
            return "**EV/IV Training Guide:**\n\n**IVs** (Individual Values): 0-31 per stat, determined at catch/hatch. Use Hyper Training to max them.\n\n**EVs** (Effort Values): 0-252 per stat, 510 total. Gained from battling or vitamins.\n\nCommon spreads:\n- **252 Atk / 252 Spe / 4 HP** — Physical sweeper\n- **252 HP / 252 Def / 4 SpD** — Physical wall\n- **252 SpA / 252 Spe / 4 HP** — Special sweeper";
        }

        if (msg.match(/mega evolut/)) {
            return "**Mega Evolution** was introduced in Gen 6 (Kalos). A Pokemon holding its Mega Stone can Mega Evolve once per battle, gaining boosted stats and sometimes a new type or ability.\n\nTop Megas: Mega Rayquaza, Mega Mewtwo X/Y, Mega Blaziken, Mega Kangaskhan, Mega Gengar.\n\nMega Evolution is returning in **Pokemon Legends: Z-A**!";
        }

        if (msg.match(/today.*pokemon|pokemon.*today|daily/)) {
            const id = getDailyPokemonId();
            const result = await this.pokemonInfo(String(id));
            if (result) return `**Today's Pokemon of the Day:**\n\n${result}`;
            return "Check the **Daily Pokemon** page to see today's featured Pokemon!";
        }

        if (msg.match(/movie|film|anime|show|watch/)) {
            return "**Latest Pokemon media:**\n\n🎬 **Pokemon Horizons** — The latest anime following Liko and Roy\n🎮 **Pokemon Legends: Z-A** — Upcoming game set in Kalos\n📺 Watch on Netflix, Hulu, or Pokemon TV\n\nVisit the **News** page for all the latest updates!";
        }

        if (msg.match(/quiz|trivia|test/)) {
            return "Want to test your Pokemon knowledge? Head to the **Games** section! We have a Pokemon Quiz, 'Who's That Pokemon?', Type Calculator, and more!";
        }

        if (msg.match(/starter|which.*choose|best.*starter/)) {
            return "Every starter is great! Fan favorites by generation:\n\n🔥 Gen 1: Charmander → Charizard\n🌊 Gen 3: Mudkip → Swampert\n🔥 Gen 4: Chimchar → Infernape\n🐸 Gen 6: Froakie → Greninja\n🌱 Gen 9: Sprigatito → Meowscarada\n\nUltimately, pick the one you love most!";
        }

        if (msg.match(/shiny|rare.*pokemon/)) {
            return "**Shiny Pokemon** have alternate color schemes and are very rare!\n\n- Base rate: 1/4096 in modern games\n- Masuda Method: 1/683 (breeding with foreign Pokemon)\n- Shiny Charm: Further reduces odds\n- Chain fishing/hunting: Various rates\n\nYou can see shiny versions on each Pokemon's detail page in our Pokedex!";
        }

        if (msg.match(/how many|total.*pokemon|all.*pokemon/)) {
            return "As of Generation 9, there are **1025 Pokemon** in the National Pokedex! Here's the breakdown:\n\n- Gen 1 (Kanto): #1-151\n- Gen 2 (Johto): #152-251\n- Gen 3 (Hoenn): #252-386\n- Gen 4 (Sinnoh): #387-493\n- Gen 5 (Unova): #494-649\n- Gen 6 (Kalos): #650-721\n- Gen 7 (Alola): #722-809\n- Gen 8 (Galar): #810-898\n- Gen 9 (Paldea): #899-1025";
        }

        if (msg.match(/evolv|evolution/)) {
            return "Pokemon can evolve in many ways:\n\n⬆️ **Level Up** — Most common (e.g., Charmander → Charmeleon at Lv16)\n🪨 **Stones** — Fire, Water, Thunder, Moon, etc.\n🤝 **Trade** — Haunter → Gengar, Machoke → Machamp\n❤️ **Friendship** — Eevee → Espeon/Umbreon\n📍 **Location** — Magneton → Magnezone at special spots\n\nCheck any Pokemon's page in the Pokedex for its full evolution chain!";
        }

        if (msg.match(/nature|natures/)) {
            return "**Natures** boost one stat by 10% and lower another by 10%. Key competitive natures:\n\n⚔️ **Adamant** (+Atk, -SpA) — Physical attackers\n💫 **Modest** (+SpA, -Atk) — Special attackers\n💨 **Jolly** (+Spe, -SpA) — Fast physical\n💨 **Timid** (+Spe, -Atk) — Fast special\n🛡️ **Bold** (+Def, -Atk) — Physical walls\n🛡️ **Calm** (+SpD, -Atk) — Special walls";
        }

        if (msg.match(/abilit/)) {
            return "**Abilities** give Pokemon passive effects in battle!\n\nFamous abilities:\n- **Intimidate** — Lowers foe's Attack on entry\n- **Levitate** — Immune to Ground moves\n- **Protean** — Changes type to match move used\n- **Multiscale** — Halves damage at full HP\n- **Speed Boost** — Raises Speed each turn\n\nSome Pokemon have Hidden Abilities — rarer but often stronger!";
        }

        const pokemonNames = msg.match(/\b(tell me about|what is|who is|info on|details on|show me|explain)\s+(\w+)/);
        if (pokemonNames) {
            const result = await this.pokemonInfo(pokemonNames[2]);
            if (result) return result;
        }

        const singleWord = msg.replace(/[^a-z]/g, '');
        if (singleWord.length > 2 && singleWord.length < 15) {
            const result = await this.pokemonInfo(singleWord);
            if (result) return result;
        }

        return "I'm not sure about that, but I can help with:\n\n• **Pokemon info** — Just type any Pokemon name!\n• **Type matchups** — 'fire type effective'\n• **Team building** — Get team advice\n• **EVs/IVs** — Training guides\n• **Natures & Abilities** — Competitive tips\n• **Evolutions** — How Pokemon evolve\n• **Starters** — Best starter picks\n• **Shinies** — Shiny hunting tips\n\nTry asking 'Tell me about Pikachu' or 'What is dragon weak against?'";
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function sendOakMessage() {
    const input = document.getElementById('oak-input');
    const messages = document.getElementById('oak-messages');
    const text = input.value.trim();
    if (!text) return;

    messages.innerHTML += `
        <div class="oak-message user">
            <div class="oak-msg-content">${escapeHtml(text)}</div>
            <span class="oak-msg-avatar">👤</span>
        </div>`;
    input.value = '';

    messages.innerHTML += `
        <div class="oak-message bot" id="oak-typing">
            <span class="oak-msg-avatar">🧑‍🔬</span>
            <div class="oak-msg-content" style="opacity: 0.6;">Thinking...</div>
        </div>`;
    messages.scrollTop = messages.scrollHeight;

    const response = await OAK_AI.getResponse(text);

    const typing = document.getElementById('oak-typing');
    if (typing) typing.remove();

    const formatted = response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    messages.innerHTML += `
        <div class="oak-message bot">
            <span class="oak-msg-avatar">🧑‍🔬</span>
            <div class="oak-msg-content">${formatted}</div>
        </div>`;
    messages.scrollTop = messages.scrollHeight;
}

function initChat() {
    TCG_POCKET.load();

    // TCG Pocket widget
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            document.getElementById('oak-window').classList.remove('open');
            TCG_UI.goHome();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // Professor Oak AI widget
    const oakToggle = document.getElementById('oak-toggle');
    const oakWindow = document.getElementById('oak-window');
    const oakClose = document.getElementById('oak-close');
    const oakInput = document.getElementById('oak-input');
    const oakSend = document.getElementById('oak-send');

    oakToggle.addEventListener('click', () => {
        oakWindow.classList.toggle('open');
        if (oakWindow.classList.contains('open')) {
            chatWindow.classList.remove('open');
            oakInput.focus();
        }
    });

    oakClose.addEventListener('click', () => {
        oakWindow.classList.remove('open');
    });

    oakSend.addEventListener('click', sendOakMessage);
    oakInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendOakMessage();
    });
}
