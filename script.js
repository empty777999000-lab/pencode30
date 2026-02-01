/**
 * INFINITY VAULT ENGINE V8.0
 * Features: Live Price Fetching, Custom UI Dropdown, Real-time Calculation
 */

// --- CONFIGURATION ---
const ASSETS = [
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB (Smart Chain)', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=025' },
    { id: 'tether', symbol: 'USDT', name: 'USDT (Tether BEP20)', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=025' },
    { id: 'ethereum', symbol: 'ETH', name: 'ETH (Ethereum)', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025' },
    { id: 'solana', symbol: 'SOL', name: 'SOL (Solana)', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=025' },
    { id: 'tron', symbol: 'TRX', name: 'TRX (Tron Network)', icon: 'https://cryptologos.cc/logos/tron-trx-logo.png?v=025' }
];

let currentAsset = ASSETS[0]; // Default BNB
let currentPrice = 0; // Will be fetched
let userBalance = 0; // Mock balance

// --- DOM ELEMENTS ---
const els = {
    dropBtn: document.getElementById('dropdownBtn'),
    dropMenu: document.getElementById('dropdownMenu'),
    selectedIcon: document.getElementById('selectedIcon'),
    selectedName: document.getElementById('selectedName'),
    dropArrow: document.getElementById('dropArrow'),
    stakeInput: document.getElementById('stakeAmount'),
    liveUsd: document.getElementById('liveUsdVal'),
    marketPrice: document.getElementById('marketPrice'),
    activeSymbols: document.querySelectorAll('.active-symbol')
};

// --- 1. INITIALIZATION ---
window.onload = async () => {
    initParticles(); // Background (defined below)
    generateDropdown(); // Create custom UI
    await fetchLivePrices(); // Get real API prices
    
    // Simulate a random wallet balance for demo
    userBalance = (Math.random() * 5).toFixed(4); 
};

// --- 2. LIVE PRICE ENGINE (CoinGecko API) ---
async function fetchLivePrices() {
    try {
        // Fetching prices for all assets at once
        const ids = ASSETS.map(a => a.id).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await res.json();
        
        // Update current asset price
        currentPrice = data[currentAsset.id].usd;
        updatePriceDisplay();
        
        console.log("Prices Synced:", data);
    } catch (e) {
        console.log("API Limit/Error, using fallback prices.");
        // Fallback if API fails
        const fallback = { binancecoin: 620, tether: 1, ethereum: 3200, solana: 110, tron: 0.12 };
        currentPrice = fallback[currentAsset.id];
        updatePriceDisplay();
    }
}

function updatePriceDisplay() {
    els.marketPrice.innerText = currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    calculateUSD(); // Recalculate input value
}

// --- 3. CUSTOM DROPDOWN LOGIC ---
function generateDropdown() {
    els.dropMenu.innerHTML = ''; // Clear
    ASSETS.forEach(asset => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.innerHTML = `<img src="${asset.icon}"><span>${asset.name}</span>`;
        div.onclick = () => selectAsset(asset);
        els.dropMenu.appendChild(div);
    });
}

// Toggle Dropdown
els.dropBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop click from closing immediately
    const isHidden = els.dropMenu.classList.contains('hidden');
    
    if (isHidden) {
        els.dropMenu.classList.remove('hidden');
        els.dropArrow.style.transform = 'rotate(180deg)';
    } else {
        closeDropdown();
    }
});

// Close when clicking outside
document.addEventListener('click', () => closeDropdown());

function closeDropdown() {
    els.dropMenu.classList.add('hidden');
    els.dropArrow.style.transform = 'rotate(0deg)';
}

async function selectAsset(asset) {
    currentAsset = asset;
    
    // Update UI
    els.selectedIcon.src = asset.icon;
    els.selectedName.innerText = asset.name;
    els.activeSymbols.forEach(el => el.innerText = asset.symbol);
    
    // Reset Input
    els.stakeInput.value = '';
    els.liveUsd.innerText = '0.00';
    
    // Fetch new price immediately
    await fetchLivePrices();
    
    closeDropdown();
}

// --- 4. REAL-TIME CALCULATION ---
els.stakeInput.addEventListener('input', calculateUSD);

function calculateUSD() {
    const amount = parseFloat(els.stakeInput.value);
    if (isNaN(amount) || amount <= 0) {
        els.liveUsd.innerText = '0.00';
        return;
    }
    
    const totalUsd = amount * currentPrice;
    els.liveUsd.innerText = totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- 5. PERCENTAGE BUTTONS ---
document.querySelectorAll('.perc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const p = parseFloat(e.target.dataset.p);
        const val = (userBalance * p).toFixed(4);
        els.stakeInput.value = val;
        calculateUSD();
    });
});

// --- 6. BACKGROUND ANIMATION ---
function initParticles() {
    const canvas = document.getElementById('neuralCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for(let i=0; i<50; i++) {
        particles.push({
            x: Math.random()*canvas.width, 
            y: Math.random()*canvas.height, 
            vx: (Math.random()-0.5), 
            vy: (Math.random()-0.5)
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00f2ff';
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}