import { fetchCampData } from './api.js';
import { initStore, setActiveTab } from './store.js';
import { renderApp } from './ui.js';

// --- Bootup Sequence ---
async function bootstrap() {
    const viewContainer = document.getElementById('view-container');
    viewContainer.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-muted); font-weight:bold;">Se încarcă datele...</div>`;

    const data = await fetchCampData();
    if (!data) {
        viewContainer.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#e03030; font-weight:bold; text-align:center; padding:20px;">Eroare la conectare.<br>Verificați conexiunea.</div>`;
        return;
    }

    initStore(data);
    
    // Attach tab click listeners globally
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveTab(btn.dataset.tab);
            renderApp();
        });
    });

    // Initial render
    renderApp();
}

// --- Service Worker & PWA Logic ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.error(err));
    });
}

let deferredPrompt;
const installContainer = document.getElementById('install-container');
const installButton = document.getElementById('install-button');

if (installContainer && installButton) {
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
}

// Start App
document.addEventListener('DOMContentLoaded', bootstrap);
