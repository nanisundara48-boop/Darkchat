/* ========================================================
   TRUE CHATS - MASTER JAVASCRIPT ENGINE (MOBILE OPTIMIZED)
   ======================================================== */

// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';

let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase CDN ఇండెక్స్ ఫైల్‌లో మిస్ అయింది!");
    }
} catch (error) {
    console.error("Supabase Initialization Error:", error);
}

// 2. STATE MANAGEMENT
let currentUser = null;
let activeChat = null;
let isPrivateMode = false;
let peerConnection = null;

// 3. INITIALIZATION & NC LOADING
window.addEventListener('DOMContentLoaded', () => {
    console.log("True Chats Engine Initialized...");
    
    // పాత పద్ధతి కాకుండా, నేరుగా స్టైల్ ని మార్చేద్దాం
    setTimeout(() => {
        const loader = document.getElementById('nc-loading');
        const auth = document.getElementById('auth-container');
        
        if (loader) {
            loader.style.display = 'none'; // CSS క్లాస్ తో సంబంధం లేకుండా హైడ్ చేస్తుంది
        }
        if (auth) {
            auth.style.display = 'flex'; // నేరుగా ఫ్లెక్స్ బాక్స్ లా చూపిస్తుంది
            auth.classList.remove('hidden');
        }
        console.log("Loading Finished!");
    }, 3000);

    try { initAuthListeners(); } catch (e) { console.error(e); }
    try { initAppNavigation(); } catch (e) { console.error(e); }
    try { initMobilePrivacyHold(); } catch (e) { console.error(e); }
});


    

/* ========================================================
   AUTH & CAT ANIMATIONS
   ======================================================== */
function initAuthListeners() {
    const loginIdInput = document.getElementById('login-id');
    const loginPassInput = document.getElementById('login-password');
    const catContainer = document.getElementById('cat-container');

    // Cat Peekaboo logic
    if (loginIdInput && catContainer) {
        loginIdInput.addEventListener('focus', () => catContainer.classList.add('cat-peek'));
        loginIdInput.addEventListener('blur', () => catContainer.classList.remove('cat-peek'));
    }

    // Cat Cover Eyes logic (Password focus)
    if (loginPassInput && catContainer) {
        loginPassInput.addEventListener('focus', () => {
            catContainer.classList.add('cat-peek');
            catContainer.classList.add('cat-cover-eyes');
        });
        loginPassInput.addEventListener('blur', () => {
            catContainer.classList.remove('cat-peek');
            catContainer.classList.remove('cat-cover-eyes');
        });
    }

    // Toggle Tabs
    const tabRegister = document.getElementById('tab-register');
    const tabLogin = document.getElementById('tab-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabRegister && tabLogin && loginForm && registerForm) {
        tabRegister.onclick = () => {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
        };
    }

    const btnGenJoin = document.getElementById('btn-generate-join');
    const btnLogin = document.getElementById('btn-login');
    if (btnGenJoin) btnGenJoin.onclick = handleRegistration;
    if (btnLogin) btnLogin.onclick = handleLogin;
}

// Generate Unique #ID Logic
function generateUniqueId(username) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${username.toLowerCase()}#${randomNum}`;
}

async function handleRegistration() {
    if (!supabase) return alert("Database disconnected!");
    const user = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const uniqueId = generateUniqueId(user);

    const { data, error } = await supabase.from('users').insert([
        { username: user, email: email, password: pass, unique_id: uniqueId, referrals: 0 }
    ]);

    if (!error) {
        alert(`Welcome! Your Unique ID is: ${uniqueId}`);
        location.reload();
    } else {
        alert("Registration Failed: " + error.message);
    }
}

async function handleLogin() {
    if (!supabase) return alert("Database disconnected!");
    const idOrMail = document.getElementById('login-id').value;
    const pass = document.getElementById('login-password').value;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${idOrMail},unique_id.eq.${idOrMail}`)
        .eq('password', pass)
        .single();

    if (data) {
        currentUser = data;
        launchApp();
    } else {
        alert("Invalid Credentials!");
    }
}

/* ========================================================
   APP CORE LOGIC
   ======================================================== */
function launchApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('display-profile-username').innerText = currentUser.username;
    
    // Check for 5 referrals star
    if (currentUser.referrals >= 5) {
        const goldStar = document.getElementById('golden-star');
        if (goldStar) goldStar.classList.remove('hidden');
    }

    setupRealtimeSubscriptions();
}

function initAppNavigation() {
    const navItems = document.querySelectorAll('.footer-nav-item');
    navItems.forEach(item => {
        item.onclick = () => {
            const tab = item.getAttribute('data-tab');
            document.querySelectorAll('.tab-screen').forEach(s => s.classList.add('hidden'));
            const targetScreen = document.getElementById(`screen-${tab}`);
            if (targetScreen) targetScreen.classList.remove('hidden');
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        };
    });
}

/* ========================================================
   PRIVACY CHAT & DARK UI (1.5s Mobile Touch Hold)
   ======================================================== */
let holdTimer;
function initMobilePrivacyHold() {
    const profileZone = document.getElementById('header-profile-zone');
    if (!profileZone) return;

    // డెస్క్‌టాప్ మౌస్ సపోర్ట్
    profileZone.onmousedown = startHold;
    profileZone.onmouseup = clearHold;

    // మొబైల్ టచ్ స్క్రీన్ సపోర్ట్ (ఇది నీకు ఇప్పుడు పక్కాగా పనిచేస్తుంది!)
    profileZone.addEventListener('touchstart', startHold, { passive: true });
    profileZone.addEventListener('touchend', clearHold);
}

function startHold() {
    holdTimer = setTimeout(() => {
        openPrivacyLock();
    }, 1500);
}

function clearHold() {
    clearTimeout(holdTimer);
}

function openPrivacyLock() {
    const lockGate = document.getElementById('security-lock-gate');
    if (lockGate) lockGate.classList.remove('hidden');
}

// PIN Verification for Private Chat
const pinInputs = document.querySelectorAll('.pin-digit-box');
pinInputs.forEach((input, index) => {
    input.onkeyup = (e) => {
        if (e.target.value && index < 3) pinInputs[index + 1].focus();
        if (index === 3) verifySecurityCode();
    };
});

function verifySecurityCode() {
    let code = "";
    pinInputs.forEach(i => code += i.value);
    
    if (code === "1234") {
        enterDarkVault();
    } else {
        alert("Access Denied!");
        const lockGate = document.getElementById('security-lock-gate');
        if (lockGate) lockGate.classList.add('hidden');
    }
}

function enterDarkVault() {
    isPrivateMode = true;
    const lockGate = document.getElementById('security-lock-gate');
    const maskLayer = document.getElementById('screenshot-inhibitor-mask-layer');
    
    if (lockGate) lockGate.classList.add('hidden');
    document.body.classList.add('pure-dark-theme-override');
    if (maskLayer) maskLayer.classList.remove('hidden');
    
    setTimeout(() => {
        if (maskLayer) maskLayer.classList.add('hidden');
    }, 2000);
}

/* ========================================================
   SEARCH & REQUEST SYSTEM
   ======================================================== */
const searchInput = document.getElementById('input-search-query');
if (searchInput) {
    searchInput.oninput = async (e) => {
        if (!supabase) return;
        const query = e.target.value;
        if (query.length >= 1) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .ilike('username', `%${query}%`);
            
            renderSearchResults(data);
        }
    };
}

function renderSearchResults(users) {
    const target = document.getElementById('search-results-target');
    if (!target) return;
    target.innerHTML = "";
    users.forEach(u => {
        if (currentUser && u.id === currentUser.id) return;
        const div = document.createElement('div');
        div.className = "search-item glass-effect";
        div.innerHTML = `
            <span>${u.username} (${u.unique_id})</span>
            <button onclick="sendRequest('${u.id}', this)">Add+</button>
        `;
        target.appendChild(div);
    });
}

async function sendRequest(targetId, btn) {
    if (!supabase) return;
    btn.innerText = "Sent✓";
    btn.disabled = true;
    await supabase.from('notifications').insert([
        { from_user: currentUser.id, to_user: targetId, type: 'request' }
    ]);
}

/* ========================================================
   WEBRTC CALLING
   ======================================================== */
async function startCall(isVideo = false) {
    const callLayer = document.getElementById('webrtc-call-interface-layer');
    const localVideo = document.getElementById('webrtc-local-video-element');
    const stateLabel = document.getElementById('call-link-state-label');

    if (callLayer) callLayer.classList.remove('hidden');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: isVideo, 
            audio: true 
        });
        if (localVideo) localVideo.srcObject = stream;
    } catch (err) {
        console.error("Media Error:", err);
    }
    
    if (stateLabel) stateLabel.innerText = "Ringing...";
}

const btnTerminate = document.getElementById('btn-hardware-terminate-session');
if (btnTerminate) {
    btnTerminate.onclick = () => {
        const localVideo = document.getElementById('webrtc-local-video-element');
        if (localVideo && localVideo.srcObject) {
            const stream = localVideo.srcObject;
            stream.getTracks().forEach(track => track.stop());
        }
        const callLayer = document.getElementById('webrtc-call-interface-layer');
        if (callLayer) callLayer.classList.add('hidden');
    };
}

/* ========================================================
   MESSAGING STATUS DOTS
   ======================================================== */
function getStatusColor(status) {
    if (status === 'sent') return 'red';
    if (status === 'delivered') return 'yellow';
    if (status === 'seen') return 'green';
    return 'grey';
}

/* ========================================================
   REALTIME SUBSCRIPTIONS
   ======================================================== */
function setupRealtimeSubscriptions() {
    if (!supabase || !currentUser) return;
    supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `to_user=eq.${currentUser.id}` }, payload => {
            updateNotificationCount();
        })
        .subscribe();
}

function updateNotificationCount() {
    const badge = document.getElementById('global-notif-count');
    if (!badge) return;
    let count = parseInt(badge.innerText || "0") + 1;
    badge.innerText = count;
    badge.classList.remove('hidden');
}

// 3 Lines Settings Toggle
const btnSettings = document.getElementById('btn-trigger-settings');
if (btnSettings) {
    btnSettings.onclick = () => {
        const panelSettings = document.getElementById('panel-settings-modal');
        if (panelSettings) panelSettings.classList.toggle('hidden');
    };
}

const btnLogout = document.getElementById('btn-system-logout');
if (btnLogout) {
    btnLogout.onclick = () => {
        location.reload();
    };
}
