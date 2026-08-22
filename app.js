// --- 1. Service Worker & PWA Logic ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.error(err));
    });
}

let deferredPrompt;
const installContainer = document.getElementById('install-container');
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installContainer.classList.remove('hidden');
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installContainer.classList.add('hidden');
    }
});
window.addEventListener('appinstalled', () => installContainer.classList.add('hidden'));

// --- 2. Data & State ---
const TEAMS = [
    { id: 1, name: "Leii", emoji: "🦁", image: "old/imports/teams-photos-51.jpg", color: "#e8650a", gradFrom: "#e8650a", gradTo: "#ff9c50", points: 2840 },
    { id: 2, name: "Lupii", emoji: "🐺", image: "old/imports/teams-photos-3.jpg", color: "#e03030", gradFrom: "#b01e1e", gradTo: "#e03030", points: 2415 },
    { id: 3, name: "Ursii", emoji: "🐻", image: "old/imports/teams-photos-59.jpg", color: "#3a7bd5", gradFrom: "#1a4a9a", gradTo: "#3a7bd5", points: 1990 }
];

const RANKED = [...TEAMS].sort((a, b) => b.points - a.points);
const MAX_POINTS = RANKED[0].points;
const EVOLUTION_DATA = [
    { day: "D1", Leii: 420, Lupii: 380, Ursii: 310 },
    { day: "D2", Leii: 780, Lupii: 720, Ursii: 590 },
    { day: "D3", Leii: 1300, Lupii: 1210, Ursii: 980 },
    { day: "D4", Leii: 2100, Lupii: 1850, Ursii: 1490 },
    { day: "Azi", Leii: 2840, Lupii: 2415, Ursii: 1990 }
];

const PODIUM_ORDER = [RANKED[1], RANKED[0], RANKED[2]];
const PODIUM_HEIGHTS = ["112px", "144px", "80px"];
const PODIUM_MEDALS = ["🥈", "🥇", "🥉"];

let activeTab = 'home';
let selectedTeam = null;
let expandedActivity = null;

const BIBLE_VERSE = {
    reference: "Filipeni 4:13",
    text: "Pot totul în Hristos care mă întărește.",
};

const ACTIVITIES = [
    { id: 1, name: "Tir cu Arcul", location: "North Field", time: "9:00", icon: "🎯", pts: 80, rules: "Fiecare echipă are 3 runde. Fiecare jucător trage 3 săgeți. Bulseye = 10 pts, inel mijlociu = 5 pts, inel exterior = 2 pts. Câștigă echipa cu cel mai mare total." },
    { id: 2, name: "Kayaking", location: "Lake Shore", time: "11:00", icon: "🚣", pts: 120, rules: "Cursă de viteză pe 200m. Ordinea de sosire decide punctele: 1st = 120, 2nd = 80, 3rd = 50. Penalizare de 10 pts pentru depășirea balizelor." },
    { id: 3, name: "Escaladă", location: "Granite Wall", time: "14:00", icon: "🧗", pts: 100, rules: "Fiecare echipă trimite 2 escaladatori. Timp maxim: 5 min per persoană. Puncte pentru înălțimea atinsă (10 pts/metru). Bonus de 20 pts pentru finalizare." },
    { id: 4, name: "Foc de Tabără", location: "Central Pit", time: "20:00", icon: "🔥", pts: 60, rules: "Seară de worship și reflecție. Fiecare echipă pregătește un moment creativ (5 min). Voturi din partea tuturor: 1st = 60, 2nd = 40, 3rd = 20 pts." }
];

const QUICK_LINKS = [
    { icon: "music", label: "Playlist FOC:US CAMP", sub: "Deschide în Spotify", bg: "rgba(29,185,84,0.1)", border: "rgba(29,185,84,0.2)", dot: "#1db954", href: "https://open.spotify.com" },
    { icon: "shirt", label: "Merch oficial", sub: "Vizitează magazinul", bg: "rgba(232,101,10,0.1)", border: "rgba(232,101,10,0.2)", dot: "#e8650a", href: "https://instagram.com" },
    { icon: "instagram", label: "@focus.camp", sub: "Instagram oficial", bg: "rgba(225,48,108,0.1)", border: "rgba(225,48,108,0.2)", dot: "#e1306c", href: "https://instagram.com" }
];

// --- 3. Rendering Logic ---
const viewContainer = document.getElementById('view-container');

function render() {
    if (selectedTeam) {
        renderTeamDetail(selectedTeam);
    } else {
        if (activeTab === 'home') renderHome();
        else if (activeTab === 'compass') renderExplore();
        else if (activeTab === 'verses') renderVerses();
    }
    lucide.createIcons();
    updateTabUI();
}

function renderHome() {
    // Generate HTML for home view
    let html = `
        <div class="view-section header-section">
            <div class="header-bg-glow"></div>
            <div style="position:relative; z-index:10; text-align:center;">
                <p style="font-size:10px; color:var(--text-muted); font-weight:700; letter-spacing:0.1em; margin-bottom:4px;">Ziua 4 din 14</p>
                <h1 style="font-size:36px; font-weight:900; line-height:1;">FOC<span style="color:var(--color-leii);">:US</span><br>CAMP</h1>
            </div>
        </div>

        <div class="view-section">
            <h2 class="section-title">Clasament</h2>
            <div class="card-panel">
                <div class="podium-container">
                    ${PODIUM_ORDER.map((t, i) => `
                        <button class="podium-slot" onclick="selectTeam(${t.id})">
                            ${i === 1 ? '<div style="font-size:20px; margin-bottom:4px;">👑</div>' : ''}
                            <div class="avatar-box" style="border: 2px solid ${t.color}33;">
                                <img src="${t.image}" alt="${t.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <span class="emoji" style="display:none;">${t.emoji}</span>
                                <div class="rank-badge" style="background:${t.color};">${i === 1 ? 1 : i === 0 ? 2 : 3}</div>
                            </div>
                            <div style="text-align:center; margin-bottom:8px;">
                                <div style="font-size:12px; font-weight:700;">${t.name}</div>
                                <div style="font-size:10px; font-weight:600; color:${t.color};">${t.points}</div>
                            </div>
                            <div class="podium-bar" style="height:${PODIUM_HEIGHTS[i]}; background: linear-gradient(180deg, ${t.gradFrom}33 0%, ${t.gradFrom}11 100%); border: 1px solid ${t.color}33; border-bottom:none;">
                                ${PODIUM_MEDALS[i]}
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="view-section">
            <h2 class="section-title">Puncte</h2>
            <div style="display:flex; flex-direction:column; gap:16px;">
                ${RANKED.map(t => `
                    <div class="points-row">
                        <div class="points-header">
                            <div class="points-team-info">
                                <div class="mini-avatar">
                                    <img src="${t.image}" alt="${t.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                    <span class="emoji" style="display:none;">${t.emoji}</span>
                                </div>
                                <span style="font-size:14px; font-weight:700;">${t.name}</span>
                            </div>
                            <span style="font-size:14px; font-weight:700; color:${t.color};">${t.points} pts</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width:${(t.points / MAX_POINTS) * 100}%; background: linear-gradient(90deg, ${t.gradFrom}, ${t.gradTo});"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="view-section">
            <h2 class="section-title">Evoluție Puncte</h2>
            <div class="card-panel">
                <canvas id="evolutionChart" height="180"></canvas>
            </div>
        </div>
        <div style="height:20px;"></div>
    `;
    
    viewContainer.innerHTML = html;

    // Initialize Chart.js
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: EVOLUTION_DATA.map(d => d.day),
            datasets: [
                { label: 'Leii', data: EVOLUTION_DATA.map(d => d.Leii), borderColor: '#e8650a', backgroundColor: '#e8650a', borderWidth: 2, tension: 0.3, pointRadius: 4 },
                { label: 'Lupii', data: EVOLUTION_DATA.map(d => d.Lupii), borderColor: '#e03030', backgroundColor: '#e03030', borderWidth: 2, tension: 0.3, pointRadius: 3 },
                { label: 'Ursii', data: EVOLUTION_DATA.map(d => d.Ursii), borderColor: '#3a7bd5', backgroundColor: '#3a7bd5', borderWidth: 2, tension: 0.3, pointRadius: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#888070', font: { family: 'Montserrat', size: 10 } } }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888070', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888070', font: { size: 10 } } }
            }
        }
    });
}

function renderTeamDetail(team) {
    const rank = RANKED.findIndex(t => t.id === team.id) + 1;
    viewContainer.innerHTML = `
        <div class="view-section" style="padding-top:24px; padding-bottom:30px; border-bottom: 1px solid ${team.color}22; background: linear-gradient(160deg, ${team.gradFrom}22 0%, #0a0a0a 65%);">
            <button class="btn-back" onclick="selectTeam(null)" style="color:${team.color};">
                <i data-lucide="arrow-left" style="width:16px; height:16px;"></i> Clasament
            </button>
            <div style="display:flex; flex-direction:column; align-items:center; gap:16px;">
                <div style="width:96px; height:96px; border-radius:24px; border: 2px solid ${team.color}66; overflow:hidden;">
                    <img src="${team.image}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="text-align:center;">
                    <h2 style="font-size:30px; font-weight:900;">Echipa ${team.name}</h2>
                    <span style="display:inline-block; margin-top:4px; padding:2px 12px; border-radius:12px; font-size:10px; font-weight:700; color:${team.color}; border: 1px solid ${team.color}40; background:${team.color}20;">LOCUL ${rank}</span>
                </div>
            </div>
        </div>
        <div class="view-section" style="margin-top:24px;">
            <div style="background:#141414; border: 1px solid ${team.color}22; border-radius:16px; padding:16px; text-align:center;">
                <div style="font-size:24px; font-weight:900; color:white;">${team.points} <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">Puncte</span></div>
            </div>
        </div>
    `;
}

function renderVerses() {
    viewContainer.innerHTML = `
        <div class="view-section" style="padding-top:16px;">
            <h1 style="font-size:30px; font-weight:900; margin-bottom:20px;">Versetul Zilei</h1>
            
            <div class="card-panel" style="position:relative; height:450px; overflow:hidden; border-radius:24px; padding:0; display:flex; flex-direction:column; justify-content:center;">
                <div style="position:absolute; inset:0; background: url('https://images.unsplash.com/photo-1466854076813-4aa9ac0fc347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxiZWF1dGlmdWwlMjBuYXR1cmUlMjBtb3VudGFpbnMlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzg0MDQ4MzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080') center/cover; z-index:0;"></div>
                <div style="position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:1;"></div>
                <div style="position:relative; z-index:2; text-align:center; padding:32px;">
                    <p style="font-size:28px; font-weight:700; line-height:1.4; color:white; margin-bottom:24px; text-shadow:0 2px 4px rgba(0,0,0,0.5);">"${BIBLE_VERSE.text}"</p>
                    <span style="font-size:16px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">${BIBLE_VERSE.reference}</span>
                </div>
            </div>
            
            <div class="card-panel" style="margin-top:20px; padding:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                    <div style="width:28px; height:28px; border-radius:8px; background:rgba(232,101,10,0.15); display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="book-open" style="width:14px; height:14px; color:var(--color-leii);"></i>
                    </div>
                    <span style="font-size:14px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">Rezumat Mesaj</span>
                </div>
                <p style="font-size:14px; color:var(--text-muted); line-height:1.6;">
                    Mesajul de astăzi a explorat tema credinței active — credința care nu stă pe loc, ci se pune în mișcare. Dumnezeu nu ne-a chemat să fim spectatori, ci participanți în planul Său. La fel cum focul are nevoie de oxigen pentru a arde, credința noastră are nevoie de acțiune pentru a fi vie. Provocarea zilei: ce pas concret vei face azi din credință?
                </p>
                <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="flame" style="width:13px; height:13px; color:var(--color-leii);"></i>
                    <span style="font-size:12px; font-weight:600; color:var(--color-leii);">Speaker: Pas. Andrei · Ziua 4</span>
                </div>
            </div>

            <div style="margin-top:20px; display:flex; flex-direction:column; gap:12px;">
                <p class="section-title">Link-uri rapide</p>
                ${QUICK_LINKS.map(link => `
                    <a href="${link.href}" target="_blank" style="display:flex; align-items:center; gap:12px; border-radius:16px; padding:14px; background:${link.bg}; border:1px solid ${link.border}; text-decoration:none;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i data-lucide="${link.icon}" style="width:18px; height:18px; color:${link.dot};"></i>
                        </div>
                        <div style="flex:1; overflow:hidden;">
                            <p style="color:white; font-size:14px; font-weight:600; margin-bottom:2px;">${link.label}</p>
                            <p style="color:${link.dot}; font-size:12px;">${link.sub}</p>
                        </div>
                        <i data-lucide="external-link" style="width:14px; height:14px; color:#555;"></i>
                    </a>
                `).join('')}
            </div>
            <div style="height:20px;"></div>
        </div>
    `;
}

function renderExplore() {
    viewContainer.innerHTML = `
        <div class="view-section" style="padding-top:16px;">
            <h1 style="font-size:30px; font-weight:900; margin-bottom:12px;">Program de azi</h1>
            <div style="display:flex; flex-direction:column; gap:12px;">
                ${ACTIVITIES.map(act => {
                    const isOpen = expandedActivity === act.id;
                    return `
                        <div class="card-panel" style="padding:0; border:${isOpen ? '1px solid rgba(232,101,10,0.3)' : '1px solid rgba(255,255,255,0.06)'}; transition:all 0.3s ease;">
                            <button onclick="toggleActivity(${act.id})" style="width:100%; display:flex; align-items:center; gap:16px; padding:16px; background:none; border:none; cursor:pointer; text-align:left; color:white;">
                                <div style="width:48px; height:48px; border-radius:12px; background:rgba(232,101,10,0.1); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">
                                    ${act.icon}
                                </div>
                                <div style="flex:1;">
                                    <p style="font-size:14px; font-weight:700;">${act.name}</p>
                                    <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">${act.location}</p>
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                                    <div style="padding:4px 10px; border-radius:8px; background:rgba(232,101,10,0.12); color:var(--color-leii); border:1px solid rgba(232,101,10,0.2); font-size:11px; font-weight:700;">
                                        ${act.time}
                                    </div>
                                    <div style="display:flex; align-items:center; gap:4px; color:var(--color-leii);">
                                        <i data-lucide="zap" style="width:10px; height:10px;"></i>
                                        <span style="font-size:10px; font-weight:700;">+${act.pts}</span>
                                    </div>
                                </div>
                                <i data-lucide="${isOpen ? 'chevron-up' : 'chevron-down'}" style="width:16px; height:16px; margin-left:4px; color:${isOpen ? 'var(--color-leii)' : '#555'};"></i>
                            </button>
                            ${isOpen ? `
                                <div style="padding:0 16px 16px 16px; border-top:1px solid rgba(232,101,10,0.12);">
                                    <p class="section-title" style="color:var(--color-leii); margin-top:12px; margin-bottom:8px;">Reguli</p>
                                    <p style="font-size:12px; color:var(--text-muted); line-height:1.6;">${act.rules}</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="height:20px;"></div>
        </div>
    `;
}

// --- 4. Event Listeners ---
window.toggleActivity = (id) => {
    expandedActivity = expandedActivity === id ? null : id;
    render();
};

window.selectTeam = (id) => {
    selectedTeam = id ? TEAMS.find(t => t.id === id) : null;
    render();
};

function updateTabUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === activeTab) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        selectedTeam = null;
        render();
    });
});

// Initial render
document.addEventListener('DOMContentLoaded', render);
