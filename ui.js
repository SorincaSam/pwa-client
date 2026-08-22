import { state, setActiveTab, setSelectedTeam, toggleActivity } from './store.js';

const viewsCache = {
    home: null,
    compass: null,
    verses: null,
    teamDetail: null
};

export function renderApp() {
    const leader = state.ranked[0];
    if (leader) {
        document.documentElement.style.setProperty('--color-leader', leader.color);
        const hex = leader.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        document.documentElement.style.setProperty('--color-leader-rgb', `${r}, ${g}, ${b}`);
    }

    const viewContainer = document.getElementById('view-container');
    
    // Hide all cached views
    Array.from(viewContainer.children).forEach(child => child.style.display = 'none');

    function getView(id) {
        if (!viewsCache[id]) {
            viewsCache[id] = document.createElement('div');
            viewsCache[id].id = `view-${id}`;
            viewContainer.appendChild(viewsCache[id]);
        }
        viewsCache[id].style.display = 'block';
        return viewsCache[id];
    }

    if (state.selectedTeam) {
        const container = getView('teamDetail');
        renderTeamDetail(container, state.selectedTeam);
    } else {
        if (state.activeTab === 'home') {
            const container = getView('home');
            const currentActivityState = container.dataset.expandedActivity || 'null';
            const newActivityState = String(state.expandedActivity);
            
            if (container.innerHTML === '' || currentActivityState !== newActivityState) {
                renderHome(container);
                container.dataset.expandedActivity = newActivityState;
            }
        }
        else if (state.activeTab === 'compass') {
            const container = getView('compass');
            if (container.innerHTML === '') renderExplore(container);
        }
        else if (state.activeTab === 'verses') {
            const container = getView('verses');
            if (container.innerHTML === '') renderVerses(container);
        }
    }
    
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
    updateTabUI();
}

function updateTabUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === state.activeTab) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function renderHome(container) {
    const PODIUM_HEIGHTS = ["112px", "144px", "80px"];
    const PODIUM_MEDALS = ["🥈", "🥇", "🥉"];

    let html = `
        <div class="view-section header-section">
            <div class="header-bg-glow"></div>
            <div style="position:relative; z-index:10; text-align:center;">
                <h1 style="font-size:36px; font-weight:900; line-height:1;">${state.campInfo.titlePart1}<span style="color:var(--color-leader);">${state.campInfo.titleHighlight}</span><br>${state.campInfo.titlePart2}</h1>
            </div>
        </div>

        <div class="view-section">
            <h2 class="section-title">Clasament</h2>
            <div class="card-panel">
                <div class="podium-container">
                    ${state.podiumOrder.map((t, i) => `
                        <button class="podium-slot" data-team="${t.id}">
                            ${i === 1 ? '<div style="font-size:20px; margin-bottom:4px;">👑</div>' : ''}
                            <div class="avatar-box" style="border: 2px solid ${t.color}33;">
                                <img src="${t.image}" alt="${t.name}" style="object-position: ${t.imageOffset || 'center'};" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
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
                ${state.ranked.map(t => `
                    <div class="points-row">
                        <div class="points-header">
                            <div class="points-team-info">
                                <div class="mini-avatar">
                                    <img src="${t.image}" alt="${t.name}" style="object-position: ${t.imageOffset || 'center'};" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                    <span class="emoji" style="display:none;">${t.emoji}</span>
                                </div>
                                <span style="font-size:14px; font-weight:700;">${t.name}</span>
                            </div>
                            <span style="font-size:14px; font-weight:700; color:${t.color};">${t.points} pts</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width:${(t.points / state.maxPoints) * 100}%; background: linear-gradient(90deg, ${t.gradFrom}, ${t.gradTo});"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="view-section">
            <h2 class="section-title">FOC:US Coins</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                ${state.teams.map(t => `
                    <div style="background: linear-gradient(145deg, #181818, #101010); border: 1px solid ${t.color}33; border-radius: 16px; padding: 16px 12px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                        <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: ${t.color}; filter: blur(25px); opacity: 0.2; border-radius: 50%;"></div>
                        <i data-lucide="coins" style="width: 24px; height: 24px; color: ${t.color}; margin-bottom: 8px;"></i>
                        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">${t.name}</div>
                        <div style="font-size: 18px; font-weight: 900; color: white;">${t.coins}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        ${state.evolution && state.evolution.length > 1 ? `
        <div class="view-section">
            <h2 class="section-title">Evoluție Puncte</h2>
            <div class="card-panel">
                <canvas id="evolutionChart" height="180"></canvas>
            </div>
        </div>
        ` : ''}
        <div style="height:20px;"></div>
    `;
    
    container.innerHTML = html;

    // Attach podium click handlers
    document.querySelectorAll('.podium-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            setSelectedTeam(parseInt(slot.dataset.team));
            renderApp();
        });
    });

    // Initialize Chart if needed
    if (state.evolution && state.evolution.length > 1) {
        setTimeout(initChart, 0);
    }
}

function initChart() {
    const canvas = document.getElementById('evolutionChart');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    
    if (window.evolutionChartInstance) {
        window.evolutionChartInstance.destroy();
    }

    window.evolutionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: state.evolution.map(d => d.day),
            datasets: state.teams.map(t => ({
                label: t.name,
                data: state.evolution.map(d => d[t.name]),
                borderColor: t.color,
                backgroundColor: t.color,
                borderWidth: 2,
                tension: 0.3,
                pointRadius: state.ranked[0].id === t.id ? 5 : 3
            }))
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

function renderTeamDetail(container, team) {
    const rank = state.ranked.findIndex(t => t.id === team.id) + 1;
    container.innerHTML = `
        <div class="view-section" style="padding-top:24px; padding-bottom:30px; border-bottom: 1px solid ${team.color}22; background: linear-gradient(160deg, ${team.gradFrom}22 0%, #0a0a0a 65%);">
            <button class="btn-back" id="back-btn" style="color:${team.color};">
                <i data-lucide="arrow-left" style="width:16px; height:16px;"></i> Clasament
            </button>
            <div style="display:flex; flex-direction:column; align-items:center; gap:16px;">
                <div style="width:96px; height:96px; border-radius:24px; border: 2px solid ${team.color}66; overflow:hidden;">
                    <img src="${team.image}" style="width:100%; height:100%; object-fit:cover; object-position:${team.imageOffset || 'center'};" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.nextElementSibling.style.fontSize='40px'; this.nextElementSibling.style.alignItems='center'; this.nextElementSibling.style.justifyContent='center'; this.nextElementSibling.style.width='100%'; this.nextElementSibling.style.height='100%';">
                    <span class="emoji" style="display:none;">${team.emoji}</span>
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

    document.getElementById('back-btn').addEventListener('click', () => {
        setSelectedTeam(null);
        renderApp();
    });
}

function renderVerses(container) {
    const v = state.verse;
    const s = state.summary;
    container.innerHTML = `
        <div class="view-section" style="padding-top:16px;">
            <h1 style="font-size:30px; font-weight:900; margin-bottom:20px;">Versetul Zilei</h1>
            
            <div class="card-panel" style="position:relative; height:450px; overflow:hidden; border-radius:24px; padding:0; display:flex; flex-direction:column; justify-content:center;">
                <div style="position:absolute; inset:0; background: url('${v.bgImage}') center/cover; z-index:0;"></div>
                <div style="position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:1;"></div>
                <div style="position:relative; z-index:2; text-align:center; padding:32px;">
                    <p style="font-size:28px; font-weight:700; line-height:1.4; color:white; margin-bottom:24px; text-shadow:0 2px 4px rgba(0,0,0,0.5);">"${v.text}"</p>
                    <span style="font-size:16px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">${v.reference}</span>
                </div>
            </div>
            
            <div class="card-panel" style="margin-top:20px; padding:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                    <div style="width:28px; height:28px; border-radius:8px; background:rgba(var(--color-leader-rgb),0.15); display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="book-open" style="width:14px; height:14px; color:var(--color-leader);"></i>
                    </div>
                    <span style="font-size:14px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">${s.title}</span>
                </div>
                <p style="font-size:14px; color:var(--text-muted); line-height:1.6;">
                    ${s.text}
                </p>
                <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="flame" style="width:13px; height:13px; color:var(--color-leader);"></i>
                    <span style="font-size:12px; font-weight:600; color:var(--color-leader);">${s.speakerInfo}</span>
                </div>
            </div>

            <div style="margin-top:20px; display:flex; flex-direction:column; gap:12px;">
                <p class="section-title">Link-uri rapide</p>
                ${state.quickLinks.map(link => `
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

function renderExplore(container) {
    container.innerHTML = `
        <div class="view-section" style="padding-top:16px;">
            <h1 style="font-size:30px; font-weight:900; margin-bottom:12px;">Program de azi</h1>
            <div style="display:flex; flex-direction:column; gap:12px;">
                ${state.activities.map(act => {
                    const isOpen = state.expandedActivity === act.id;
                    return `
                        <div class="card-panel" style="padding:0; border:${isOpen ? '1px solid rgba(var(--color-leader-rgb),0.3)' : '1px solid rgba(255,255,255,0.06)'}; transition:all 0.3s ease;">
                            <button class="activity-btn" data-id="${act.id}" style="width:100%; display:flex; align-items:center; gap:16px; padding:16px; background:none; border:none; cursor:pointer; text-align:left; color:white;">
                                <div style="width:48px; height:48px; border-radius:12px; background:rgba(var(--color-leader-rgb),0.1); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">
                                    ${act.icon}
                                </div>
                                <div style="flex:1;">
                                    <p style="font-size:14px; font-weight:700;">${act.name}</p>
                                    <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">${act.location}</p>
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                                    <div style="padding:4px 10px; border-radius:8px; background:rgba(var(--color-leader-rgb),0.12); color:var(--color-leader); border:1px solid rgba(var(--color-leader-rgb),0.2); font-size:11px; font-weight:700;">
                                        ${act.time}
                                    </div>
                                </div>
                                <i data-lucide="${isOpen ? 'chevron-up' : 'chevron-down'}" style="width:16px; height:16px; margin-left:4px; color:${isOpen ? 'var(--color-leader)' : '#555'};"></i>
                            </button>
                            ${isOpen ? `
                                <div style="padding:0 16px 16px 16px; border-top:1px solid rgba(var(--color-leader-rgb),0.12);">
                                    <p class="section-title" style="color:var(--color-leader); margin-top:12px; margin-bottom:8px;">Reguli</p>
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

    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleActivity(parseInt(btn.dataset.id));
            renderApp();
        });
    });
}
