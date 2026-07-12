/* ============================================
   POKEMON! - Pokemon Go Style Game
   ============================================ */

const POGO = {
    REGION_ORDER: [
        { regionName: 'Kanto', level: 1 },
        { regionName: 'Johto', level: 2 },
        { regionName: 'Hoenn', level: 3 },
        { regionName: 'Unova', level: 4 },
        { regionName: 'Kalos', level: 5 },
        { regionName: 'Alola', level: 6 },
        { regionName: 'Galar', level: 7 },
        { regionName: 'Paldea', level: 8 }
    ],

    save: null,
    spawns: [],
    spawnTimer: null,
    moveTimer: null,
    activeTab: 'map',
    catchTarget: null,
    battleTarget: null,
    battleState: null,
    playerX: 50,
    playerY: 50,
    targetX: 50,
    targetY: 50,
    isMoving: false,
    kmCounter: 0,

    load() {
        const d = localStorage.getItem('pogo_save');
        if (d) {
            this.save = JSON.parse(d);
        } else {
            this.save = {
                name: null,
                level: 1,
                xp: 0,
                xpNeeded: 1000,
                team: null,
                currentRegion: 'Kanto',
                currentLevel: 1,
                pokeballs: 20,
                greatballs: 5,
                ultraballs: 2,
                razz: 5,
                potions: 10,
                stardust: 0,
                candy: 0,
                pokemon: [],
                caughtIds: [],
                buddy: null,
                km: 0,
                pokestopsCooldown: {},
                gymsDefeated: {},
                regionsCompleted: [],
                legendariesCaught: [],
                mythicalsCaught: [],
                totalCaught: 0,
                totalSpins: 0,
                den: []
            };
        }
    },

    persist() { localStorage.setItem('pogo_save', JSON.stringify(this.save)); },

    addXP(amount) {
        this.save.xp += amount;
        while (this.save.xp >= this.save.xpNeeded) {
            this.save.xp -= this.save.xpNeeded;
            this.save.level++;
            this.save.xpNeeded = Math.floor(1000 * Math.pow(1.2, this.save.level - 1));
        }
        this.persist();
    },

    getRegion() { return REGIONS.find(r => r.name === this.save.currentRegion); },

    getRegionPokemon() {
        const r = this.getRegion();
        if (!r) return [];
        return Object.keys(POKEMON_BY_ID).filter(k => {
            const id = parseInt(k);
            return id >= r.range[0] && id <= r.range[1] && !LEGENDARIES.includes(id) && !MYTHICALS.includes(id);
        }).map(k => parseInt(k));
    },

    getRegionLegendaries() {
        const r = this.getRegion();
        if (!r) return [];
        return LEGENDARIES.filter(id => id >= r.range[0] && id <= r.range[1] && POKEMON_BY_ID[id]);
    },

    getRegionMythicals() {
        const r = this.getRegion();
        if (!r) return [];
        return MYTHICALS.filter(id => id >= r.range[0] && id <= r.range[1] && POKEMON_BY_ID[id]);
    },

    spawnPokemon() {
        this.spawns = [];
        const pool = this.getRegionPokemon();
        if (pool.length === 0) return;
        const count = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const id = pool[Math.floor(Math.random() * pool.length)];
            const p = POKEMON_BY_ID[id];
            if (!p) continue;
            this.spawns.push({
                id: p.id, name: p.name, types: p.types,
                wx: this.playerX + (Math.random() - 0.5) * 80,
                wy: this.playerY + (Math.random() - 0.5) * 80,
                cp: Math.floor((p.stats[0].base_stat + p.stats[1].base_stat) * (0.5 + this.save.level * 0.05) * (0.8 + Math.random() * 0.4)),
                hp: p.stats[0].base_stat,
                fleTimer: 60 + Math.floor(Math.random() * 60)
            });
        }
    },

    movePlayer(dx, dy) {
        this.playerX += dx;
        this.playerY += dy;
        this.kmCounter += Math.sqrt(dx*dx + dy*dy) * 0.01;
        if (this.kmCounter >= 1) {
            this.save.km += Math.floor(this.kmCounter);
            this.kmCounter -= Math.floor(this.kmCounter);
            this.persist();
        }
        this.updateMapPositions();
    },

    startWalking(dx, dy) {
        if (this.moveTimer) clearInterval(this.moveTimer);
        this.isMoving = true;
        this.movePlayer(dx, dy);
        this.moveTimer = setInterval(() => this.movePlayer(dx, dy), 150);
    },

    stopWalking() {
        this.isMoving = false;
        if (this.moveTimer) { clearInterval(this.moveTimer); this.moveTimer = null; }
    },

    walkTo(mapX, mapY) {
        const dx = mapX - 50;
        const dy = mapY - 50;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 2) return;
        const step = 3;
        const sx = (dx / dist) * step;
        const sy = (dy / dist) * step;
        const steps = Math.min(Math.ceil(dist / step), 20);
        let i = 0;
        if (this.moveTimer) clearInterval(this.moveTimer);
        this.isMoving = true;
        this.moveTimer = setInterval(() => {
            this.movePlayer(sx, sy);
            i++;
            if (i >= steps) { this.stopWalking(); }
        }, 100);
    },

    updateMapPositions() {
        const map = document.getElementById('pogo-map');
        if (!map) return;
        const items = map.querySelectorAll('[data-wx]');
        items.forEach(el => {
            const wx = parseFloat(el.dataset.wx);
            const wy = parseFloat(el.dataset.wy);
            const sx = 50 + (wx - this.playerX);
            const sy = 50 + (wy - this.playerY);
            el.style.left = sx + '%';
            el.style.top = sy + '%';
            el.style.display = (sx < -10 || sx > 110 || sy < -10 || sy > 110) ? 'none' : '';
        });
    },

    canCompleteRegion() {
        const r = this.getRegion();
        if (!r) return false;
        const legs = this.getRegionLegendaries();
        const myths = this.getRegionMythicals();
        const allLeg = legs.every(id => this.save.legendariesCaught.includes(id));
        const allMyth = myths.every(id => this.save.mythicalsCaught.includes(id));
        const gyms = r.gyms || [];
        const allGyms = gyms.every((g, i) => this.save.gymsDefeated[this.save.currentRegion + '_' + i]);
        return allLeg && allMyth && allGyms && (legs.length + myths.length > 0 || allGyms);
    },

    completeRegion() {
        const rName = this.save.currentRegion;
        const regionPokes = this.save.pokemon.filter(p => {
            const r = this.getRegion();
            return p.id >= r.range[0] && p.id <= r.range[1];
        });
        regionPokes.forEach(p => this.save.den.push({ ...p, fromRegion: rName }));
        this.save.pokemon = this.save.pokemon.filter(p => {
            const r = this.getRegion();
            return p.id < r.range[0] || p.id > r.range[1];
        });
        this.save.regionsCompleted.push(rName);
        const idx = this.REGION_ORDER.findIndex(r => r.regionName === rName);
        if (idx < this.REGION_ORDER.length - 1) {
            this.save.currentRegion = this.REGION_ORDER[idx + 1].regionName;
            this.save.currentLevel = this.REGION_ORDER[idx + 1].level;
        }
        this.save.gymsDefeated = {};
        this.addXP(2000);
        this.persist();
    }
};

/* ============================================
   RENDERING
   ============================================ */

function spriteUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function renderAdventure() {
    POGO.load();
    return `<div id="pogo-root"></div>`;
}

function initAdventure() {
    POGO.load();
    if (!POGO.save.name) {
        renderPogoSetup();
    } else {
        startPogoGame();
    }
}

function renderPogoSetup() {
    const el = document.getElementById('pogo-root');
    el.innerHTML = `
        <div class="pogo-setup">
            <div class="pogo-setup-bg"></div>
            <div class="pogo-setup-content">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" class="pogo-setup-pika" alt="">
                <h1 class="pogo-setup-title">POKEMON!</h1>
                <p class="pogo-setup-sub">Get up and Go!</p>
                <div class="pogo-setup-form">
                    <input type="text" id="pogo-name" class="pogo-setup-input" placeholder="Trainer name..." maxlength="16">
                    <div class="pogo-team-pick">
                        <p>Choose your team:</p>
                        <div class="pogo-teams">
                            <button class="pogo-team-btn" data-team="valor" onclick="pickTeam('valor')">
                                <span class="pogo-team-icon" style="background:#ef4444">🔥</span>Valor
                            </button>
                            <button class="pogo-team-btn" data-team="mystic" onclick="pickTeam('mystic')">
                                <span class="pogo-team-icon" style="background:#3b82f6">❄️</span>Mystic
                            </button>
                            <button class="pogo-team-btn" data-team="instinct" onclick="pickTeam('instinct')">
                                <span class="pogo-team-icon" style="background:#eab308">⚡</span>Instinct
                            </button>
                        </div>
                    </div>
                    <button class="pogo-setup-go" onclick="submitPogoSetup()">Let's GO!</button>
                </div>
            </div>
        </div>`;
    setTimeout(() => { const inp = document.getElementById('pogo-name'); if (inp) inp.focus(); }, 100);
}

let selectedTeam = null;
function pickTeam(team) {
    selectedTeam = team;
    document.querySelectorAll('.pogo-team-btn').forEach(b => b.classList.toggle('selected', b.dataset.team === team));
}

function submitPogoSetup() {
    const name = document.getElementById('pogo-name').value.trim();
    if (!name) return;
    if (!selectedTeam) { selectedTeam = 'valor'; }
    POGO.save.name = name;
    POGO.save.team = selectedTeam;
    POGO.persist();
    startPogoGame();
}

function startPogoGame() {
    POGO.spawnPokemon();
    renderPogoMap();
    if (POGO.spawnTimer) clearInterval(POGO.spawnTimer);
    POGO.spawnTimer = setInterval(() => {
        POGO.spawnPokemon();
        if (POGO.activeTab === 'map') renderPogoMap();
    }, 45000);

    document.addEventListener('keydown', handlePogoKey);
    document.addEventListener('keyup', handlePogoKeyUp);
}

function handlePogoKey(e) {
    if (POGO.activeTab !== 'map') return;
    const step = 4;
    const keyMap = { ArrowUp: [0,-step], ArrowDown: [0,step], ArrowLeft: [-step,0], ArrowRight: [step,0], w:[0,-step], s:[0,step], a:[-step,0], d:[step,0] };
    const dir = keyMap[e.key];
    if (dir) { e.preventDefault(); POGO.movePlayer(dir[0], dir[1]); }
}
function handlePogoKeyUp(e) { POGO.stopWalking(); }

/* === MAP VIEW === */
function renderPogoMap() {
    POGO.activeTab = 'map';
    const el = document.getElementById('pogo-root');
    const s = POGO.save;
    const r = POGO.getRegion();
    const xpPct = Math.round((s.xp / s.xpNeeded) * 100);
    const teamColors = { valor: '#ef4444', mystic: '#3b82f6', instinct: '#eab308' };
    const tc = teamColors[s.team] || '#3b82f6';
    const px = POGO.playerX;
    const py = POGO.playerY;

    const toScreen = (wx, wy) => [50 + (wx - px), 50 + (wy - py)];
    const visible = (sx, sy) => sx > -15 && sx < 115 && sy > -15 && sy < 115;

    // PokeStops in world space (spread around starting area)
    const stopWorldPos = [[50,20],[10,50],[90,50],[50,85],[30,35],[70,65]];
    // Gyms in world space
    const gymWorldPos = [[-30,-25],[35,-30],[-25,30],[35,35]];
    const gyms = (r.gyms || []).slice(0, 4);

    let mapItems = '';

    // Pokestops
    stopWorldPos.forEach((wp, i) => {
        const [sx, sy] = toScreen(wp[0], wp[1]);
        if (!visible(sx, sy)) return;
        const key = s.currentRegion + '_stop_' + i;
        const cd = s.pokestopsCooldown[key];
        const onCooldown = cd && (Date.now() - cd < 300000);
        mapItems += `<div class="pogo-stop ${onCooldown ? 'pogo-stop-used' : ''}" data-wx="${wp[0]}" data-wy="${wp[1]}" style="left:${sx}%;top:${sy}%" onclick="${onCooldown ? '' : `spinPokestop(${i})`}">
            <div class="pogo-stop-cube"></div>
        </div>`;
    });

    // Gyms
    gyms.forEach((gym, i) => {
        const wp = gymWorldPos[i] || [0,0];
        const [sx, sy] = toScreen(wp[0], wp[1]);
        if (!visible(sx, sy)) return;
        const defeated = s.gymsDefeated[s.currentRegion + '_' + i];
        mapItems += `<div class="pogo-gym ${defeated ? 'pogo-gym-owned' : ''}" data-wx="${wp[0]}" data-wy="${wp[1]}" style="left:${sx}%;top:${sy}%" onclick="tapGym(${i},'${gym.replace(/'/g, "\\'")}')">
            <div class="pogo-gym-tower" style="border-color:${defeated ? tc : '#888'}"></div>
            <span class="pogo-gym-label">${gym.length > 10 ? gym.slice(0, 9) + '…' : gym}</span>
        </div>`;
    });

    // Wild pokemon
    POGO.spawns.forEach((sp, i) => {
        const [sx, sy] = toScreen(sp.wx, sp.wy);
        if (!visible(sx, sy)) return;
        mapItems += `<div class="pogo-wild" data-wx="${sp.wx}" data-wy="${sp.wy}" style="left:${sx}%;top:${sy}%" onclick="tapWild(${i})">
            <img src="${spriteUrl(sp.id)}" alt="${sp.name}">
        </div>`;
    });

    // Legendaries/Mythicals as raid bosses (fixed world position)
    const legs = POGO.getRegionLegendaries().filter(id => !s.legendariesCaught.includes(id));
    const myths = POGO.getRegionMythicals().filter(id => !s.mythicalsCaught.includes(id));
    const raidWP = [0, -10];
    if (legs.length > 0) {
        const lid = legs[0];
        const [sx, sy] = toScreen(raidWP[0], raidWP[1]);
        if (visible(sx, sy)) {
            mapItems += `<div class="pogo-raid" data-wx="${raidWP[0]}" data-wy="${raidWP[1]}" style="left:${sx}%;top:${sy}%" onclick="tapRaid(${lid},'legendary')">
                <div class="pogo-raid-egg">⭐5</div>
                <img src="${spriteUrl(lid)}" alt="">
            </div>`;
        }
    } else if (myths.length > 0) {
        const mid = myths[0];
        const [sx, sy] = toScreen(raidWP[0], raidWP[1]);
        if (visible(sx, sy)) {
            mapItems += `<div class="pogo-raid" data-wx="${raidWP[0]}" data-wy="${raidWP[1]}" style="left:${sx}%;top:${sy}%" onclick="tapRaid(${mid},'mythical')">
                <div class="pogo-raid-egg">🌟EX</div>
                <img src="${spriteUrl(mid)}" alt="">
            </div>`;
        }
    }

    const canComplete = POGO.canCompleteRegion();
    const kmText = s.km > 0 ? ` · ${s.km.toFixed(1)} km` : '';

    el.innerHTML = `
        <div class="pogo-game">
            <!-- Top Bar -->
            <div class="pogo-topbar">
                <div class="pogo-profile-mini" onclick="renderPogoProfile()">
                    <div class="pogo-level-circle" style="border-color:${tc}">${s.level}</div>
                    <div class="pogo-xpbar-mini"><div style="width:${xpPct}%;background:${tc}"></div></div>
                </div>
                <div class="pogo-region-badge" style="background:${r.color}">${r.emoji} ${r.name}${kmText}</div>
                <div class="pogo-items-mini">
                    <span>🔴${s.pokeballs}</span>
                    <span>✨${s.stardust}</span>
                </div>
            </div>

            <!-- Map -->
            <div class="pogo-map" id="pogo-map" onclick="pogoMapClick(event)">
                <div class="pogo-map-terrain"></div>
                ${mapItems}
                <!-- Player Avatar -->
                <div class="pogo-player">
                    <div class="pogo-player-ring" style="border-color:${tc}"></div>
                    <div class="pogo-player-dot" style="background:${tc}">🧑</div>
                </div>
                <!-- Nearby -->
                <div class="pogo-nearby" onclick="event.stopPropagation(); renderPogoNearby()">
                    <span>Nearby</span>
                    ${POGO.spawns.slice(0, 3).map(sp => `<img src="${spriteUrl(sp.id)}" alt="">`).join('')}
                </div>
                <!-- Arena -->
                <div class="pogo-arena" data-wx="60" data-wy="-20" style="left:${50 + (60 - px)}%;top:${50 + (-20 - py)}%" onclick="event.stopPropagation(); renderPogoArena()">
                    <div class="pogo-arena-icon">🏟️</div>
                    <span class="pogo-arena-label">Battle Arena</span>
                </div>
                <!-- D-Pad -->
                <div class="pogo-dpad">
                    <button class="pogo-dpad-btn pogo-dpad-up" onmousedown="POGO.startWalking(0,-4)" onmouseup="POGO.stopWalking()" onmouseleave="POGO.stopWalking()" ontouchstart="event.preventDefault();POGO.startWalking(0,-4)" ontouchend="POGO.stopWalking()">▲</button>
                    <button class="pogo-dpad-btn pogo-dpad-left" onmousedown="POGO.startWalking(-4,0)" onmouseup="POGO.stopWalking()" onmouseleave="POGO.stopWalking()" ontouchstart="event.preventDefault();POGO.startWalking(-4,0)" ontouchend="POGO.stopWalking()">◄</button>
                    <button class="pogo-dpad-btn pogo-dpad-right" onmousedown="POGO.startWalking(4,0)" onmouseup="POGO.stopWalking()" onmouseleave="POGO.stopWalking()" ontouchstart="event.preventDefault();POGO.startWalking(4,0)" ontouchend="POGO.stopWalking()">►</button>
                    <button class="pogo-dpad-btn pogo-dpad-down" onmousedown="POGO.startWalking(0,4)" onmouseup="POGO.stopWalking()" onmouseleave="POGO.stopWalking()" ontouchstart="event.preventDefault();POGO.startWalking(0,4)" ontouchend="POGO.stopWalking()">▼</button>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="pogo-bottombar">
                <button class="pogo-bot-btn ${POGO.activeTab === 'profile' ? 'active' : ''}" onclick="renderPogoProfile()">
                    <span>👤</span>Profile
                </button>
                <button class="pogo-bot-btn ${POGO.activeTab === 'pokemon' ? 'active' : ''}" onclick="renderPogoPokemon()">
                    <span>📦</span>Pokemon
                </button>
                <div class="pogo-pokeball-btn" onclick="renderPogoMap()">
                    <div class="pogo-pokeball-icon"></div>
                </div>
                <button class="pogo-bot-btn ${POGO.activeTab === 'items' ? 'active' : ''}" onclick="renderPogoItems()">
                    <span>🎒</span>Items
                </button>
                <button class="pogo-bot-btn" onclick="renderPogoArena()">
                    <span>⚔️</span>Battle
                </button>
            </div>

            ${canComplete ? `<div class="pogo-complete-banner" onclick="completePogoRegion()">✅ Region Complete! Tap to move on →</div>` : ''}
        </div>`;
}

/* === MAP CLICK TO WALK === */
function pogoMapClick(e) {
    const map = document.getElementById('pogo-map');
    if (!map) return;
    const rect = map.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    POGO.walkTo(clickX, clickY);
}

/* === POKESTOP === */
function spinPokestop(idx) {
    const s = POGO.save;
    const key = s.currentRegion + '_stop_' + idx;
    s.pokestopsCooldown[key] = Date.now();
    const balls = 2 + Math.floor(Math.random() * 3);
    const dust = 50 + Math.floor(Math.random() * 50);
    s.pokeballs += balls;
    s.stardust += dust;
    s.totalSpins++;
    let extras = '';
    if (Math.random() < 0.3) { s.greatballs++; extras += ' +1 Great Ball!'; }
    if (Math.random() < 0.2) { s.razz++; extras += ' +1 Razz Berry!'; }
    if (Math.random() < 0.15) { s.potions += 2; extras += ' +2 Potions!'; }
    POGO.addXP(50);
    showPogoToast(`PokeStop! +${balls} Pokeballs, +${dust} Stardust${extras}`);
    renderPogoMap();
}

/* === WILD ENCOUNTER === */
function tapWild(idx) {
    const sp = POGO.spawns[idx];
    if (!sp) return;
    POGO.catchTarget = { ...sp, razzed: false, ballType: 'poke' };
    renderPogoCatch();
}

function renderPogoCatch() {
    POGO.activeTab = 'catch';
    const el = document.getElementById('pogo-root');
    const t = POGO.catchTarget;
    const p = POKEMON_BY_ID[t.id];
    const bst = p.stats.reduce((a, s) => a + s.base_stat, 0);
    const baseRate = Math.max(10, 75 - Math.floor(bst / 10));
    const ballBonus = t.ballType === 'ultra' ? 20 : t.ballType === 'great' ? 10 : 0;
    const razzBonus = t.razzed ? 10 : 0;
    const rate = Math.min(95, baseRate + ballBonus + razzBonus);
    const ringColor = rate > 60 ? '#22c55e' : rate > 35 ? '#f59e0b' : '#ef4444';
    const tc = { normal:'#a8a878', fire:'#f08030', water:'#6890f0', electric:'#f8d030', grass:'#78c850', ice:'#98d8d8', fighting:'#c03028', poison:'#a040a0', ground:'#e0c068', flying:'#a890f0', psychic:'#f85888', bug:'#a8b820', rock:'#b8a038', ghost:'#705898', dragon:'#7038f8', dark:'#705848', steel:'#b8b8d0', fairy:'#ee99ac' };

    el.innerHTML = `
        <div class="pogo-catch-screen">
            <div class="pogo-catch-bg" style="background:linear-gradient(180deg, #87CEEB 0%, #98d8a0 60%, #78a85a 100%)"></div>
            <button class="pogo-catch-run" onclick="runFromCatch()">↩ Run</button>
            <div class="pogo-catch-info">
                <span class="pogo-catch-name">${t.name}</span>
                <span class="pogo-catch-cp">CP ${t.cp}</span>
            </div>
            <div class="pogo-catch-pokemon">
                <div class="pogo-catch-ring" style="border-color:${ringColor}"></div>
                <img src="${spriteUrl(t.id)}" alt="${t.name}" class="pogo-catch-sprite">
            </div>
            <div class="pogo-catch-types">
                ${t.types.map(tp => `<span style="background:${tc[tp]||'#888'}">${tp}</span>`).join('')}
            </div>
            <div class="pogo-catch-rate">${rate}% catch rate</div>
            <div class="pogo-catch-controls">
                <button class="pogo-berry-btn ${t.razzed?'used':''}" onclick="useRazz()">🍇 Razz${t.razzed?' ✓':''}</button>
                <button class="pogo-throw-btn" onclick="throwPogoBall()">
                    <span class="pogo-ball-display">${t.ballType === 'ultra' ? '🟣' : t.ballType === 'great' ? '🔵' : '🔴'}</span>
                    Throw!
                </button>
                <div class="pogo-ball-switch">
                    <button class="${t.ballType==='poke'?'active':''}" onclick="switchBall('poke')">🔴 ${POGO.save.pokeballs}</button>
                    <button class="${t.ballType==='great'?'active':''}" onclick="switchBall('great')">🔵 ${POGO.save.greatballs}</button>
                    <button class="${t.ballType==='ultra'?'active':''}" onclick="switchBall('ultra')">🟣 ${POGO.save.ultraballs}</button>
                </div>
            </div>
        </div>`;
}

function switchBall(type) {
    POGO.catchTarget.ballType = type;
    renderPogoCatch();
}

function useRazz() {
    if (POGO.catchTarget.razzed || POGO.save.razz <= 0) return;
    POGO.save.razz--;
    POGO.catchTarget.razzed = true;
    POGO.persist();
    renderPogoCatch();
}

function throwPogoBall() {
    const t = POGO.catchTarget;
    const s = POGO.save;
    const ballKey = t.ballType === 'ultra' ? 'ultraballs' : t.ballType === 'great' ? 'greatballs' : 'pokeballs';
    if (s[ballKey] <= 0) { showPogoToast('No balls left!'); return; }
    s[ballKey]--;

    const p = POKEMON_BY_ID[t.id];
    const bst = p.stats.reduce((a, st) => a + st.base_stat, 0);
    const baseRate = Math.max(10, 75 - Math.floor(bst / 10));
    const ballBonus = t.ballType === 'ultra' ? 20 : t.ballType === 'great' ? 10 : 0;
    const razzBonus = t.razzed ? 10 : 0;
    const rate = Math.min(95, baseRate + ballBonus + razzBonus);

    if (Math.random() * 100 < rate) {
        const pokemon = {
            id: p.id, name: p.name, types: p.types, cp: t.cp,
            hp: p.stats[0].base_stat, maxHp: p.stats[0].base_stat,
            atk: Math.max(p.stats[1].base_stat, p.stats[3].base_stat),
            def: Math.max(p.stats[2].base_stat, p.stats[4].base_stat),
            caught: Date.now()
        };
        s.pokemon.push(pokemon);
        if (!s.caughtIds.includes(p.id)) s.caughtIds.push(p.id);
        s.totalCaught++;
        s.stardust += 100;
        s.candy += 3;
        POGO.addXP(100);
        POGO.spawns = POGO.spawns.filter(sp => sp.id !== t.id || sp.x !== t.x);
        showPogoCatchResult(true, t.name, t.cp);
    } else {
        if (Math.random() < 0.2) {
            POGO.spawns = POGO.spawns.filter(sp => sp.id !== t.id || sp.x !== t.x);
            showPogoCatchResult(false, t.name, t.cp, true);
        } else {
            showPogoCatchResult(false, t.name, t.cp, false);
        }
    }
    POGO.persist();
}

function showPogoCatchResult(caught, name, cp, fled) {
    const el = document.getElementById('pogo-root');
    el.innerHTML = `
        <div class="pogo-catch-result-screen">
            <div class="pogo-catch-bg" style="background:linear-gradient(180deg, #87CEEB 0%, #98d8a0 60%, #78a85a 100%)"></div>
            <div class="pogo-result-content">
                ${caught
                    ? `<div class="pogo-result-icon">✅</div><h2>Gotcha!</h2><p>${name} (CP ${cp}) was caught!</p><p class="pogo-result-rewards">+100 XP · +100 Stardust · +3 Candy</p>`
                    : fled
                        ? `<div class="pogo-result-icon">💨</div><h2>Oh no!</h2><p>${name} fled!</p>`
                        : `<div class="pogo-result-icon">💫</div><h2>Almost!</h2><p>${name} broke free!</p>`
                }
                <button class="pogo-result-btn" onclick="${caught || fled ? 'renderPogoMap()' : 'renderPogoCatch()'}">${caught || fled ? 'Back to Map' : 'Try Again'}</button>
            </div>
        </div>`;
}

function runFromCatch() {
    POGO.catchTarget = null;
    renderPogoMap();
}

/* === RAIDS (Legendaries/Mythicals) === */
function tapRaid(pokemonId, type) {
    const p = POKEMON_BY_ID[pokemonId];
    if (!p) return;
    const el = document.getElementById('pogo-root');
    const isLeg = type === 'legendary';
    el.innerHTML = `
        <div class="pogo-raid-screen">
            <div class="pogo-catch-bg" style="background:linear-gradient(180deg, ${isLeg ? '#1a1a2e' : '#2d1b69'} 0%, ${isLeg ? '#16213e' : '#1a1a2e'} 100%)"></div>
            <button class="pogo-catch-run" onclick="renderPogoMap()">← Back</button>
            <div class="pogo-raid-header">${isLeg ? '⭐ 5-Star Raid' : '🌟 EX Raid'}</div>
            <div class="pogo-raid-pokemon">
                <div class="pogo-raid-glow"></div>
                <img src="${spriteUrl(pokemonId)}" alt="${p.name}">
            </div>
            <h2 class="pogo-raid-name">${p.name}</h2>
            <div class="pogo-raid-types">${p.types.map(t => `<span class="pogo-raid-type">${t}</span>`).join('')}</div>
            <p class="pogo-raid-desc">Defeat this ${isLeg ? 'Legendary' : 'Mythical'} Pokemon in battle, then catch it!</p>
            <button class="pogo-raid-battle-btn" onclick="startRaidBattle(${pokemonId},'${type}')">⚔️ Battle! (Need 3 Pokemon)</button>
        </div>`;
}

function startRaidBattle(pokemonId, type) {
    const s = POGO.save;
    if (s.pokemon.length < 3) { showPogoToast('You need at least 3 Pokemon!'); return; }

    const boss = POKEMON_BY_ID[pokemonId];
    const mult = type === 'mythical' ? 2.5 : 2.0;
    POGO.battleState = {
        type: 'raid',
        raidType: type,
        pokemonId,
        boss: {
            id: boss.id, name: boss.name, types: boss.types,
            hp: Math.round(boss.stats[0].base_stat * mult),
            maxHp: Math.round(boss.stats[0].base_stat * mult),
            atk: Math.round(Math.max(boss.stats[1].base_stat, boss.stats[3].base_stat) * mult),
            def: Math.round(Math.max(boss.stats[2].base_stat, boss.stats[4].base_stat) * 0.8)
        },
        team: s.pokemon.slice(0, 3).map(p => ({ ...p, currentHp: p.hp })),
        teamIdx: 0,
        log: [`A wild ${boss.name} appeared!`]
    };
    renderPogoBattle();
}

/* === GYM BATTLE === */
function tapGym(idx, gymName) {
    const s = POGO.save;
    const defeated = s.gymsDefeated[s.currentRegion + '_' + idx];
    if (defeated) { showPogoToast(`${gymName} already defeated!`); return; }
    if (s.pokemon.length < 3) { showPogoToast('You need at least 3 Pokemon!'); return; }

    const r = POGO.getRegion();
    const diff = 0.6 + idx * 0.1;
    const pool = POGO.getRegionPokemon();
    const team = [];
    for (let i = 0; i < 3; i++) {
        const pid = pool[Math.floor(Math.random() * pool.length)];
        const p = POKEMON_BY_ID[pid];
        if (!p) { i--; continue; }
        team.push({
            id: p.id, name: p.name, types: p.types,
            hp: Math.round(p.stats[0].base_stat * diff),
            maxHp: Math.round(p.stats[0].base_stat * diff),
            currentHp: Math.round(p.stats[0].base_stat * diff),
            atk: Math.round(Math.max(p.stats[1].base_stat, p.stats[3].base_stat) * diff),
            def: Math.round(Math.max(p.stats[2].base_stat, p.stats[4].base_stat) * diff)
        });
    }

    POGO.battleState = {
        type: 'gym', gymIdx: idx, gymName,
        boss: team[0],
        bossTeam: team,
        bossIdx: 0,
        team: s.pokemon.slice(0, 3).map(p => ({ ...p, currentHp: p.hp })),
        teamIdx: 0,
        log: [`Gym Leader's ${team[0].name} appeared!`]
    };
    renderPogoBattle();
}

/* === BATTLE SCREEN === */
function renderPogoBattle() {
    const el = document.getElementById('pogo-root');
    const b = POGO.battleState;
    const boss = (b.type === 'gym' || b.type === 'arena') ? b.bossTeam[b.bossIdx] : b.boss;
    const me = b.team[b.teamIdx];
    const bossHpPct = Math.max(0, (boss.currentHp || boss.hp) / (boss.maxHp || boss.hp) * 100);
    const myHpPct = Math.max(0, me.currentHp / me.hp * 100);

    el.innerHTML = `
        <div class="pogo-battle-screen">
            <div class="pogo-catch-bg" style="background:linear-gradient(180deg, #4a6741 0%, #3d5a35 50%, #2d4a25 100%)"></div>
            <div class="pogo-battle-top">
                <div class="pogo-battle-boss">
                    <div class="pogo-battle-boss-info">
                        <span class="pogo-battle-boss-name">${boss.name}</span>
                        <div class="pogo-battle-hpbar"><div style="width:${bossHpPct}%;background:${bossHpPct>50?'#22c55e':bossHpPct>20?'#f59e0b':'#ef4444'}"></div></div>
                        <span class="pogo-battle-hp">${Math.max(0, boss.currentHp || boss.hp)}/${boss.maxHp || boss.hp}</span>
                    </div>
                    <div class="pogo-battle-boss-sprite">
                        <img src="${spriteUrl(boss.id)}" alt="${boss.name}">
                    </div>
                </div>
            </div>
            <div class="pogo-battle-bottom">
                <div class="pogo-battle-me">
                    <div class="pogo-battle-me-sprite">
                        <img src="${spriteUrl(me.id)}" alt="${me.name}">
                    </div>
                    <div class="pogo-battle-me-info">
                        <span>${me.name} <small>CP ${me.cp}</small></span>
                        <div class="pogo-battle-hpbar"><div style="width:${myHpPct}%;background:${myHpPct>50?'#22c55e':myHpPct>20?'#f59e0b':'#ef4444'}"></div></div>
                        <span class="pogo-battle-hp">${Math.max(0, me.currentHp)}/${me.hp}</span>
                    </div>
                </div>
                <div class="pogo-battle-log">${b.log.slice(-2).map(l => `<div>${l}</div>`).join('')}</div>
                <div class="pogo-battle-actions">
                    <button class="pogo-battle-atk" onclick="pogoBattleAttack()">⚡ Fast Attack</button>
                    <button class="pogo-battle-charge" onclick="pogoBattleCharge()">💥 Charged Attack</button>
                </div>
            </div>
        </div>`;
}

function pogoBattleAttack() { doPogoBattleTurn(1.0); }
function pogoBattleCharge() { doPogoBattleTurn(1.8); }

function doPogoBattleTurn(mult) {
    const b = POGO.battleState;
    const boss = (b.type === 'gym' || b.type === 'arena') ? b.bossTeam[b.bossIdx] : b.boss;
    const me = b.team[b.teamIdx];

    const myDmg = Math.max(1, Math.round((me.atk * mult - boss.def * 0.4) * (0.85 + Math.random() * 0.3)));
    boss.currentHp = (boss.currentHp || boss.hp) - myDmg;
    b.log.push(`${me.name} hits for ${myDmg}!`);

    if (boss.currentHp <= 0) {
        boss.currentHp = 0;
        if (b.type === 'gym' || b.type === 'arena') {
            const next = b.bossIdx + 1;
            if (next >= b.bossTeam.length) {
                wonPogoBattle();
                return;
            }
            b.bossIdx = next;
            b.log.push(`${b.bossTeam[next].name} sent out!`);
            b.bossTeam[next].currentHp = b.bossTeam[next].hp;
        } else {
            wonPogoBattle();
            return;
        }
        renderPogoBattle();
        return;
    }

    const bossDmg = Math.max(1, Math.round((boss.atk - me.def * 0.4) * (0.8 + Math.random() * 0.3)));
    me.currentHp -= bossDmg;
    b.log.push(`${boss.name} hits for ${bossDmg}!`);

    if (me.currentHp <= 0) {
        me.currentHp = 0;
        const next = b.team.findIndex((t, i) => i > b.teamIdx && t.currentHp > 0);
        if (next === -1) {
            lostPogoBattle();
            return;
        }
        b.teamIdx = next;
        b.log.push(`Go, ${b.team[next].name}!`);
    }
    renderPogoBattle();
}

function wonPogoBattle() {
    const b = POGO.battleState;
    const el = document.getElementById('pogo-root');

    if (b.type === 'gym') {
        POGO.save.gymsDefeated[POGO.save.currentRegion + '_' + b.gymIdx] = true;
        POGO.save.stardust += 500;
        POGO.addXP(500);
        el.innerHTML = `
            <div class="pogo-result-screen">
                <div class="pogo-catch-bg" style="background:linear-gradient(180deg,#1a1a2e,#16213e)"></div>
                <div class="pogo-result-content">
                    <div class="pogo-result-icon">🏟️</div>
                    <h2>Gym Defeated!</h2>
                    <p>You beat ${b.gymName}!</p>
                    <p class="pogo-result-rewards">+500 XP · +500 Stardust</p>
                    <button class="pogo-result-btn" onclick="renderPogoMap()">Back to Map</button>
                </div>
            </div>`;
    } else if (b.type === 'raid') {
        POGO.catchTarget = {
            id: b.pokemonId, name: b.boss.name, types: b.boss.types,
            cp: Math.floor(b.boss.atk * 10 + b.boss.hp * 5),
            razzed: false, ballType: 'ultra',
            isRaid: true, raidType: b.raidType
        };
        el.innerHTML = `
            <div class="pogo-result-screen">
                <div class="pogo-catch-bg" style="background:linear-gradient(180deg,#1a1a2e,#2d1b69)"></div>
                <div class="pogo-result-content">
                    <div class="pogo-result-icon">⚔️</div>
                    <h2>Raid Boss Defeated!</h2>
                    <p>Now catch ${b.boss.name}!</p>
                    <button class="pogo-result-btn" onclick="renderPogoRaidCatch()">Catch →</button>
                </div>
            </div>`;
    }
    POGO.persist();
}

function lostPogoBattle() {
    const el = document.getElementById('pogo-root');
    el.innerHTML = `
        <div class="pogo-result-screen">
            <div class="pogo-catch-bg" style="background:linear-gradient(180deg,#1a1a2e,#16213e)"></div>
            <div class="pogo-result-content">
                <div class="pogo-result-icon">💀</div>
                <h2>Defeated!</h2>
                <p>Your team fainted. Heal up and try again!</p>
                <button class="pogo-result-btn" onclick="renderPogoMap()">Back to Map</button>
            </div>
        </div>`;
}

function renderPogoRaidCatch() {
    const t = POGO.catchTarget;
    t.ballType = 'ultra';
    renderPogoCatch();
}

/* Override catch for raids */
const origThrow = throwPogoBall;
throwPogoBall = function() {
    const t = POGO.catchTarget;
    if (t && t.isRaid) {
        const s = POGO.save;
        const ballKey = t.ballType === 'ultra' ? 'ultraballs' : t.ballType === 'great' ? 'greatballs' : 'pokeballs';
        if (s[ballKey] <= 0) { showPogoToast('No balls left!'); return; }
        s[ballKey]--;
        const rate = 40 + (t.razzed ? 15 : 0) + (t.ballType === 'ultra' ? 15 : t.ballType === 'great' ? 8 : 0);
        if (Math.random() * 100 < rate) {
            const p = POKEMON_BY_ID[t.id];
            const pokemon = {
                id: p.id, name: p.name, types: p.types, cp: t.cp,
                hp: p.stats[0].base_stat, maxHp: p.stats[0].base_stat,
                atk: Math.max(p.stats[1].base_stat, p.stats[3].base_stat),
                def: Math.max(p.stats[2].base_stat, p.stats[4].base_stat),
                caught: Date.now()
            };
            s.pokemon.push(pokemon);
            if (t.raidType === 'legendary') s.legendariesCaught.push(t.id);
            else s.mythicalsCaught.push(t.id);
            s.totalCaught++;
            POGO.addXP(1000);
            POGO.persist();
            showPogoCatchResult(true, t.name, t.cp);
        } else {
            POGO.persist();
            showPogoCatchResult(false, t.name, t.cp, false);
        }
    } else {
        origThrow();
    }
};

/* === PROFILE === */
function renderPogoProfile() {
    POGO.activeTab = 'profile';
    const el = document.getElementById('pogo-root');
    const s = POGO.save;
    const teamColors = { valor: '#ef4444', mystic: '#3b82f6', instinct: '#eab308' };
    const teamNames = { valor: 'Team Valor 🔥', mystic: 'Team Mystic ❄️', instinct: 'Team Instinct ⚡' };
    const tc = teamColors[s.team] || '#3b82f6';
    const xpPct = Math.round((s.xp / s.xpNeeded) * 100);

    el.innerHTML = `
        <div class="pogo-game">
            <div class="pogo-profile">
                <div class="pogo-profile-header" style="background:linear-gradient(135deg, ${tc}, ${tc}88)">
                    <div class="pogo-profile-avatar">🧑</div>
                    <h2>${s.name}</h2>
                    <span class="pogo-profile-team">${teamNames[s.team]}</span>
                </div>
                <div class="pogo-profile-level">
                    <div class="pogo-level-big" style="border-color:${tc}">${s.level}</div>
                    <div class="pogo-xp-bar"><div style="width:${xpPct}%;background:${tc}"></div></div>
                    <span class="pogo-xp-text">${s.xp} / ${s.xpNeeded} XP</span>
                </div>
                <div class="pogo-profile-stats">
                    <div class="pogo-pstat"><span class="pogo-pstat-num">${s.totalCaught}</span><span>Caught</span></div>
                    <div class="pogo-pstat"><span class="pogo-pstat-num">${s.pokemon.length}</span><span>Pokemon</span></div>
                    <div class="pogo-pstat"><span class="pogo-pstat-num">${s.totalSpins}</span><span>PokeStops</span></div>
                    <div class="pogo-pstat"><span class="pogo-pstat-num">${s.den.length}</span><span>In Den</span></div>
                    <div class="pogo-pstat"><span class="pogo-pstat-num">${s.regionsCompleted.length}/8</span><span>Regions</span></div>
                    <div class="pogo-pstat"><span class="pogo-pstat-num">${s.stardust}</span><span>Stardust</span></div>
                </div>
                ${s.den.length > 0 ? `<button class="pogo-den-btn" onclick="renderPogoDen()">🏠 Pokemon Den (${s.den.length})</button>` : ''}
            </div>
            ${pogoBottomBar()}
        </div>`;
}

/* === POKEMON LIST === */
function renderPogoPokemon() {
    POGO.activeTab = 'pokemon';
    const el = document.getElementById('pogo-root');
    const s = POGO.save;
    const sorted = [...s.pokemon].sort((a, b) => b.cp - a.cp);

    el.innerHTML = `
        <div class="pogo-game">
            <div class="pogo-pokemon-list">
                <h3>Pokemon (${s.pokemon.length})</h3>
                <div class="pogo-pokemon-grid">
                    ${sorted.length === 0 ? '<p class="pogo-empty">No Pokemon yet! Catch some on the map.</p>' :
                    sorted.map((p, i) => `
                        <div class="pogo-pokemon-card" onclick="showPogoDetail(${i})">
                            <img src="${spriteUrl(p.id)}" alt="${p.name}">
                            <span class="pogo-pcard-name">${p.name}</span>
                            <span class="pogo-pcard-cp">CP ${p.cp}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${pogoBottomBar()}
        </div>`;
}

function showPogoDetail(idx) {
    const p = POGO.save.pokemon.sort((a, b) => b.cp - a.cp)[idx];
    if (!p) return;
    const el = document.getElementById('pogo-root');
    const tc = { normal:'#a8a878', fire:'#f08030', water:'#6890f0', electric:'#f8d030', grass:'#78c850', ice:'#98d8d8', fighting:'#c03028', poison:'#a040a0', ground:'#e0c068', flying:'#a890f0', psychic:'#f85888', bug:'#a8b820', rock:'#b8a038', ghost:'#705898', dragon:'#7038f8', dark:'#705848', steel:'#b8b8d0', fairy:'#ee99ac' };

    el.innerHTML = `
        <div class="pogo-game">
            <div class="pogo-detail">
                <button class="pogo-detail-back" onclick="renderPogoPokemon()">← Back</button>
                <div class="pogo-detail-header" style="background:linear-gradient(135deg, ${tc[p.types[0]]||'#888'}, ${p.types[1] ? tc[p.types[1]]||'#888' : tc[p.types[0]]||'#888'})">
                    <img src="${spriteUrl(p.id)}" alt="${p.name}" class="pogo-detail-sprite">
                </div>
                <h2 class="pogo-detail-name">${p.name}</h2>
                <div class="pogo-detail-cp">CP ${p.cp}</div>
                <div class="pogo-detail-types">${p.types.map(t => `<span style="background:${tc[t]||'#888'}">${t}</span>`).join('')}</div>
                <div class="pogo-detail-stats">
                    <div><span>HP</span><strong>${p.hp}</strong></div>
                    <div><span>ATK</span><strong>${p.atk}</strong></div>
                    <div><span>DEF</span><strong>${p.def}</strong></div>
                </div>
                <button class="pogo-transfer-btn" onclick="transferPokemon(${p.caught})">Transfer (+1 Candy)</button>
            </div>
            ${pogoBottomBar()}
        </div>`;
}

function transferPokemon(caught) {
    POGO.save.pokemon = POGO.save.pokemon.filter(p => p.caught !== caught);
    POGO.save.candy++;
    POGO.persist();
    renderPogoPokemon();
    showPogoToast('Pokemon transferred! +1 Candy');
}

/* === ITEMS === */
function renderPogoItems() {
    POGO.activeTab = 'items';
    const el = document.getElementById('pogo-root');
    const s = POGO.save;

    el.innerHTML = `
        <div class="pogo-game">
            <div class="pogo-items">
                <h3>🎒 Items</h3>
                <div class="pogo-items-grid">
                    <div class="pogo-item"><span class="pogo-item-icon">🔴</span><span>Pokeball</span><strong>×${s.pokeballs}</strong></div>
                    <div class="pogo-item"><span class="pogo-item-icon">🔵</span><span>Great Ball</span><strong>×${s.greatballs}</strong></div>
                    <div class="pogo-item"><span class="pogo-item-icon">🟣</span><span>Ultra Ball</span><strong>×${s.ultraballs}</strong></div>
                    <div class="pogo-item"><span class="pogo-item-icon">🍇</span><span>Razz Berry</span><strong>×${s.razz}</strong></div>
                    <div class="pogo-item"><span class="pogo-item-icon">💊</span><span>Potion</span><strong>×${s.potions}</strong></div>
                    <div class="pogo-item"><span class="pogo-item-icon">✨</span><span>Stardust</span><strong>${s.stardust}</strong></div>
                    <div class="pogo-item"><span class="pogo-item-icon">🍬</span><span>Candy</span><strong>${s.candy}</strong></div>
                </div>
                ${s.potions > 0 && s.pokemon.some(p => p.hp && p.maxHp && p.hp < p.maxHp) ? `<button class="pogo-heal-btn" onclick="healAllPokemon()">💊 Heal All Pokemon</button>` : ''}
            </div>
            ${pogoBottomBar()}
        </div>`;
}

function healAllPokemon() {
    const s = POGO.save;
    s.pokemon.forEach(p => { if (p.maxHp) p.hp = p.maxHp; });
    if (s.potions > 0) s.potions--;
    POGO.persist();
    renderPogoItems();
    showPogoToast('All Pokemon healed!');
}

/* === REGIONS === */
function renderPogoRegions() {
    POGO.activeTab = 'regions';
    const el = document.getElementById('pogo-root');
    const s = POGO.save;

    let html = `<div class="pogo-game"><div class="pogo-regions"><h3>🗺️ Regions</h3><div class="pogo-region-list">`;

    for (const ro of POGO.REGION_ORDER) {
        const r = REGIONS.find(rr => rr.name === ro.regionName);
        if (!r) continue;
        const completed = s.regionsCompleted.includes(ro.regionName);
        const current = s.currentRegion === ro.regionName;
        const locked = ro.level > s.currentLevel;

        const legs = LEGENDARIES.filter(id => id >= r.range[0] && id <= r.range[1] && POKEMON_BY_ID[id]);
        const myths = MYTHICALS.filter(id => id >= r.range[0] && id <= r.range[1] && POKEMON_BY_ID[id]);
        const legsCaught = legs.filter(id => s.legendariesCaught.includes(id)).length;
        const mythsCaught = myths.filter(id => s.mythicalsCaught.includes(id)).length;
        const gyms = r.gyms || [];
        const gymsWon = gyms.filter((g, i) => s.gymsDefeated[ro.regionName + '_' + i]).length;

        html += `
            <div class="pogo-region-card ${current ? 'pogo-region-current' : ''} ${locked ? 'pogo-region-locked' : ''}" style="border-left:4px solid ${r.color}">
                <div class="pogo-region-top">
                    <span class="pogo-region-emoji">${r.emoji}</span>
                    <div>
                        <div class="pogo-region-name">${r.name} <small>Lv.${ro.level}</small></div>
                        <div class="pogo-region-status">${completed ? '✅ Complete' : current ? '🎮 Current' : locked ? '🔒 Locked' : '—'}</div>
                    </div>
                </div>
                ${current || completed ? `
                <div class="pogo-region-progress">
                    <span>Gyms: ${gymsWon}/${gyms.length}</span>
                    <span>Legends: ${legsCaught}/${legs.length}</span>
                    <span>Mythical: ${mythsCaught}/${myths.length}</span>
                </div>` : ''}
            </div>`;
    }

    html += `</div></div>${pogoBottomBar()}</div>`;
    el.innerHTML = html;
}

/* === POKEMON DEN === */
function renderPogoDen() {
    const el = document.getElementById('pogo-root');
    const den = POGO.save.den;
    const byRegion = {};
    den.forEach(p => { const r = p.fromRegion || '?'; if (!byRegion[r]) byRegion[r] = []; byRegion[r].push(p); });

    let html = `<div class="pogo-game"><div class="pogo-den"><button class="pogo-detail-back" onclick="renderPogoProfile()">← Back</button><h3>🏠 Pokemon Den (${den.length})</h3>`;
    for (const [rName, pokes] of Object.entries(byRegion)) {
        const r = REGIONS.find(rr => rr.name === rName);
        html += `<h4>${r ? r.emoji : ''} ${rName} (${pokes.length})</h4><div class="pogo-den-grid">`;
        pokes.forEach(p => { html += `<div class="pogo-den-mon"><img src="${spriteUrl(p.id)}" alt="${p.name}"><span>${p.name}</span></div>`; });
        html += '</div>';
    }
    if (den.length === 0) html += '<p class="pogo-empty">Complete a region to send Pokemon here!</p>';
    html += `</div>${pogoBottomBar()}</div>`;
    el.innerHTML = html;
}

/* === NEARBY === */
function renderPogoNearby() {
    const el = document.getElementById('pogo-root');
    el.innerHTML = `
        <div class="pogo-game">
            <div class="pogo-nearby-list">
                <button class="pogo-detail-back" onclick="renderPogoMap()">← Back</button>
                <h3>Nearby Pokemon</h3>
                <div class="pogo-nearby-grid">
                    ${POGO.spawns.map((sp, i) => `
                        <div class="pogo-nearby-card" onclick="tapWild(${i})">
                            <img src="${spriteUrl(sp.id)}" alt="${sp.name}">
                            <span>${sp.name}</span>
                            <small>CP ~${sp.cp}</small>
                        </div>
                    `).join('')}
                    ${POGO.spawns.length === 0 ? '<p class="pogo-empty">No Pokemon nearby...</p>' : ''}
                </div>
            </div>
            ${pogoBottomBar()}
        </div>`;
}

/* === REGION COMPLETE === */
function completePogoRegion() {
    POGO.completeRegion();
    const el = document.getElementById('pogo-root');
    const prev = POGO.REGION_ORDER.find(r => POGO.save.regionsCompleted.includes(r.regionName) && r.regionName !== POGO.save.currentRegion);
    el.innerHTML = `
        <div class="pogo-result-screen">
            <div class="pogo-catch-bg" style="background:linear-gradient(180deg,#0f172a,#1e293b)"></div>
            <div class="pogo-result-content">
                <div class="pogo-result-icon">🏆</div>
                <h2>Region Complete!</h2>
                <p>All Pokemon sent to the Den. Onward to ${POGO.save.currentRegion}!</p>
                <p class="pogo-result-rewards">+2000 XP</p>
                <button class="pogo-result-btn" onclick="startPogoGame()">Explore ${POGO.save.currentRegion} →</button>
            </div>
        </div>`;
}

/* === HELPERS === */
/* === BATTLE ARENA === */
const ARENA_TRAINERS = [
    { name: 'Bug Catcher Ben', emoji: '🐛', difficulty: 'easy', reward: 200, pokemonCount: 2, mult: 0.5 },
    { name: 'Lass Sarah', emoji: '👧', difficulty: 'easy', reward: 250, pokemonCount: 2, mult: 0.6 },
    { name: 'Hiker Dave', emoji: '🧔', difficulty: 'medium', reward: 400, pokemonCount: 3, mult: 0.8 },
    { name: 'Ace Trainer Lily', emoji: '💪', difficulty: 'medium', reward: 500, pokemonCount: 3, mult: 0.9 },
    { name: 'Blackbelt Kenji', emoji: '🥋', difficulty: 'hard', reward: 700, pokemonCount: 3, mult: 1.1 },
    { name: 'Veteran Rosa', emoji: '🎖️', difficulty: 'hard', reward: 800, pokemonCount: 3, mult: 1.3 },
    { name: 'Elite Trainer Red', emoji: '🔴', difficulty: 'champion', reward: 1200, pokemonCount: 3, mult: 1.6 },
    { name: 'Champion Cynthia', emoji: '👑', difficulty: 'champion', reward: 1500, pokemonCount: 3, mult: 2.0 },
];

const ARENA_RANKS = [
    { name: 'Beginner', minWins: 0, color: '#9e9e9e' },
    { name: 'Great League', minWins: 3, color: '#42a5f5' },
    { name: 'Ultra League', minWins: 8, color: '#7c4dff' },
    { name: 'Master League', minWins: 15, color: '#ff6f00' },
    { name: 'Legend', minWins: 25, color: '#ffd600' },
];

function getArenaRank() {
    const wins = POGO.save.arenaWins || 0;
    let rank = ARENA_RANKS[0];
    for (const r of ARENA_RANKS) {
        if (wins >= r.minWins) rank = r;
    }
    return rank;
}

function renderPogoArena() {
    POGO.activeTab = 'arena';
    const el = document.getElementById('pogo-root');
    const s = POGO.save;
    if (!s.arenaWins) s.arenaWins = 0;
    if (!s.arenaLosses) s.arenaLosses = 0;
    const rank = getArenaRank();
    const nextRank = ARENA_RANKS.find(r => r.minWins > s.arenaWins);
    const teamColors = { valor: '#ef4444', mystic: '#3b82f6', instinct: '#eab308' };
    const tc = teamColors[s.team] || '#3b82f6';

    el.innerHTML = `
        <div class="pogo-game">
            <div class="pogo-arena-page">
                <div class="pogo-arena-header" style="background:linear-gradient(135deg, ${rank.color}, ${rank.color}88)">
                    <div class="pogo-arena-rank-icon">🏟️</div>
                    <h2>Battle Arena</h2>
                    <div class="pogo-arena-rank-badge" style="border-color:${rank.color}">${rank.name}</div>
                    <div class="pogo-arena-record">
                        <span>🏆 ${s.arenaWins} Wins</span>
                        <span>💀 ${s.arenaLosses} Losses</span>
                    </div>
                    ${nextRank ? `<div class="pogo-arena-next">Next rank: ${nextRank.name} (${nextRank.minWins - s.arenaWins} more wins)</div>` : `<div class="pogo-arena-next">🌟 Maximum Rank!</div>`}
                </div>

                <div class="pogo-arena-section">
                    <h3>Choose your opponent</h3>
                    <div class="pogo-arena-trainers">
                        ${ARENA_TRAINERS.map((t, i) => {
                            const diffColors = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336', champion: '#9c27b0' };
                            const needPokemon = s.pokemon.length < t.pokemonCount;
                            return `
                            <div class="pogo-arena-trainer-card ${needPokemon ? 'pogo-arena-locked' : ''}" onclick="${needPokemon ? '' : `startArenaBattle(${i})`}">
                                <div class="pogo-arena-trainer-left">
                                    <span class="pogo-arena-trainer-emoji">${t.emoji}</span>
                                    <div>
                                        <div class="pogo-arena-trainer-name">${t.name}</div>
                                        <div class="pogo-arena-trainer-diff" style="color:${diffColors[t.difficulty]}">${t.difficulty.toUpperCase()} · ${t.pokemonCount}v${t.pokemonCount}</div>
                                    </div>
                                </div>
                                <div class="pogo-arena-trainer-reward">
                                    <span>✨${t.reward}</span>
                                    <small>${needPokemon ? `Need ${t.pokemonCount} Pokemon` : 'Battle!'}</small>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <div class="pogo-arena-section">
                    <h3>Your Team (first ${Math.min(3, s.pokemon.length)} Pokemon)</h3>
                    <div class="pogo-arena-team">
                        ${s.pokemon.length === 0
                            ? '<p class="pogo-empty">Catch some Pokemon first!</p>'
                            : s.pokemon.slice(0, 3).map(p => `
                                <div class="pogo-arena-team-mon">
                                    <img src="${spriteUrl(p.id)}" alt="${p.name}">
                                    <span>${p.name}</span>
                                    <small>CP ${p.cp}</small>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <button class="pogo-detail-back" onclick="renderPogoRegions()" style="margin:16px">🗺️ View Regions</button>
            </div>
            ${pogoBottomBar()}
        </div>`;
}

function startArenaBattle(trainerIdx) {
    const trainer = ARENA_TRAINERS[trainerIdx];
    const s = POGO.save;
    if (s.pokemon.length < trainer.pokemonCount) { showPogoToast(`Need ${trainer.pokemonCount} Pokemon!`); return; }

    const pool = POGO.getRegionPokemon();
    const enemyTeam = [];
    for (let i = 0; i < trainer.pokemonCount; i++) {
        const pid = pool[Math.floor(Math.random() * pool.length)];
        const p = POKEMON_BY_ID[pid];
        if (!p) { i--; continue; }
        enemyTeam.push({
            id: p.id, name: p.name, types: p.types,
            hp: Math.round(p.stats[0].base_stat * trainer.mult),
            maxHp: Math.round(p.stats[0].base_stat * trainer.mult),
            currentHp: Math.round(p.stats[0].base_stat * trainer.mult),
            atk: Math.round(Math.max(p.stats[1].base_stat, p.stats[3].base_stat) * trainer.mult),
            def: Math.round(Math.max(p.stats[2].base_stat, p.stats[4].base_stat) * trainer.mult)
        });
    }

    POGO.battleState = {
        type: 'arena',
        trainerIdx,
        trainerName: trainer.name,
        trainerEmoji: trainer.emoji,
        reward: trainer.reward,
        boss: enemyTeam[0],
        bossTeam: enemyTeam,
        bossIdx: 0,
        team: s.pokemon.slice(0, trainer.pokemonCount).map(p => ({ ...p, currentHp: p.hp })),
        teamIdx: 0,
        log: [`${trainer.emoji} ${trainer.name} wants to battle!`, `${trainer.name} sent out ${enemyTeam[0].name}!`]
    };
    renderPogoBattle();
}

// Patch wonPogoBattle to handle arena wins
const _origWonBattle = wonPogoBattle;
wonPogoBattle = function() {
    const b = POGO.battleState;
    if (b && b.type === 'arena') {
        const s = POGO.save;
        if (!s.arenaWins) s.arenaWins = 0;
        s.arenaWins++;
        s.stardust += b.reward;
        const xpGain = Math.round(b.reward * 0.5);
        POGO.addXP(xpGain);

        const bonusBalls = Math.floor(Math.random() * 3) + 1;
        s.pokeballs += bonusBalls;
        if (Math.random() < 0.3) s.greatballs++;
        if (Math.random() < 0.15) s.ultraballs++;
        if (Math.random() < 0.25) { s.razz += 2; }
        s.potions += Math.floor(Math.random() * 3) + 1;
        POGO.persist();

        const rank = getArenaRank();
        const el = document.getElementById('pogo-root');
        el.innerHTML = `
            <div class="pogo-result-screen">
                <div class="pogo-catch-bg" style="background:linear-gradient(180deg,#1a1a2e,#16213e)"></div>
                <div class="pogo-result-content">
                    <div class="pogo-result-icon">🏆</div>
                    <h2>You Win!</h2>
                    <p>${b.trainerEmoji} ${b.trainerName} defeated!</p>
                    <p class="pogo-result-rewards">+${b.reward} Stardust · +${xpGain} XP · +${bonusBalls} Pokeballs</p>
                    <div class="pogo-arena-win-rank" style="color:${rank.color}">Rank: ${rank.name} (${s.arenaWins} wins)</div>
                    <button class="pogo-result-btn" onclick="renderPogoArena()">Back to Arena</button>
                </div>
            </div>`;
        return;
    }
    _origWonBattle();
};

const _origLostBattle = lostPogoBattle;
lostPogoBattle = function() {
    const b = POGO.battleState;
    if (b && b.type === 'arena') {
        if (!POGO.save.arenaLosses) POGO.save.arenaLosses = 0;
        POGO.save.arenaLosses++;
        POGO.persist();
        const el = document.getElementById('pogo-root');
        el.innerHTML = `
            <div class="pogo-result-screen">
                <div class="pogo-catch-bg" style="background:linear-gradient(180deg,#1a1a2e,#16213e)"></div>
                <div class="pogo-result-content">
                    <div class="pogo-result-icon">💀</div>
                    <h2>Defeated!</h2>
                    <p>${b.trainerEmoji} ${b.trainerName} was too strong!</p>
                    <p style="color:rgba(255,255,255,0.6)">Heal your Pokemon and try again!</p>
                    <button class="pogo-result-btn" onclick="renderPogoArena()">Back to Arena</button>
                </div>
            </div>`;
        return;
    }
    _origLostBattle();
};

function pogoBottomBar() {
    const teamColors = { valor: '#ef4444', mystic: '#3b82f6', instinct: '#eab308' };
    return `
        <div class="pogo-bottombar">
            <button class="pogo-bot-btn ${POGO.activeTab==='profile'?'active':''}" onclick="renderPogoProfile()"><span>👤</span>Profile</button>
            <button class="pogo-bot-btn ${POGO.activeTab==='pokemon'?'active':''}" onclick="renderPogoPokemon()"><span>📦</span>Pokemon</button>
            <div class="pogo-pokeball-btn" onclick="renderPogoMap()"><div class="pogo-pokeball-icon"></div></div>
            <button class="pogo-bot-btn ${POGO.activeTab==='items'?'active':''}" onclick="renderPogoItems()"><span>🎒</span>Items</button>
            <button class="pogo-bot-btn ${POGO.activeTab==='arena'?'active':''}" onclick="renderPogoArena()"><span>⚔️</span>Battle</button>
        </div>`;
}

function showPogoToast(msg) {
    let t = document.querySelector('.pogo-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.className = 'pogo-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}
