import { fetchCampData } from './api.js';
import { initStore, state } from './store.js';

async function bootstrap() {
    // 1. Fetch data to set the dynamic theme colors on the download page
    const data = await fetchCampData();
    if (data) {
        initStore(data);
        const leader = state.ranked[0];
        if (leader) {
            document.documentElement.style.setProperty('--color-leader', leader.color);
            const hex = leader.color;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            document.documentElement.style.setProperty('--color-leader-rgb', `${r}, ${g}, ${b}`);
        }
    }

    // 2. Install logic
    const installBtn = document.getElementById('install-btn');
    const iosInstructions = document.getElementById('ios-instructions');
    
    // Detect iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Detect if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isStandalone) {
        // If they already installed it, redirect to the app
        window.location.href = 'index.html';
        return;
    }

    if (isIos) {
        // iOS Safari doesn't support beforeinstallprompt, show manual instructions
        iosInstructions.style.display = 'block';
    }

    // Handle standard PWA install prompt (Android / Chrome)
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        
        // Show the install button since the prompt is available
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
        // Redirect to app once installed
        window.location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', bootstrap);
