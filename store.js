export const state = {
    teams: [],
    evolution: [],
    activities: [],
    quickLinks: [],
    verse: null,
    campInfo: null,
    summary: null,
    
    // Derived state
    ranked: [],
    maxPoints: 0,
    podiumOrder: [],
    
    // UI state
    activeTab: 'home',
    selectedTeam: null,
    expandedActivity: null
};

export function initStore(data) {
    if (!data) return false;
    
    state.teams = data.teams;
    state.evolution = data.evolution;
    state.activities = data.activities;
    state.quickLinks = data.quickLinks;
    state.verse = data.verse;
    state.campInfo = data.campInfo;
    state.summary = data.summary;
    
    calculateDerivedState();
    return true;
}

function calculateDerivedState() {
    state.ranked = [...state.teams].sort((a, b) => b.points - a.points);
    if (state.ranked.length > 0) {
        state.maxPoints = state.ranked[0].points || 1;
    }
    if (state.ranked.length >= 3) {
        state.podiumOrder = [state.ranked[1], state.ranked[0], state.ranked[2]];
    } else {
        state.podiumOrder = state.ranked;
    }
}

export function setActiveTab(tab) {
    state.activeTab = tab;
    state.selectedTeam = null;
    state.expandedActivity = null;
}

export function setSelectedTeam(id) {
    state.selectedTeam = id ? state.teams.find(t => t.id === id) : null;
}

export function toggleActivity(id) {
    state.expandedActivity = state.expandedActivity === id ? null : id;
}
