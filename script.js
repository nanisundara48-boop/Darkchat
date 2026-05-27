/* ========================================================
   TRUE CHATS - MASTER JAVASCRIPT ENGINE (FULLY WORKING CODE)
   ======================================================== */

// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';

let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase CDN మిస్ అయింది! HTML ఫైల్ లో స్క్రిప్ట్ టాగ్ చెక్ చెయ్.");
    }
} catch (error) {
    console.error("Supabase Error:", error);
}

// 2. STATE MANAGEMENT
let currentUser = null;
let activeChat = null; // చాట్ ఓపెన్ చేసినప్పుడు ఆ యూజర్ డేటా ఇందులో స్టోర్ అవుతుంది
let isPrivateMode = false;
let holdTimer; 

// 3. INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    console.log("True Chats Engine Initialized & Ready...");
    
    // లోడింగ్ స్క్రీన్ లాజిక్
    setTimeout(() => {
        const loader = document.getElementById('nc-loading');
        const authContainer = document.getElementById('auth-container');
        
        if (loader) loader.style.setProperty('display', 'none', 'important'); 
        if (authContainer) {
            authContainer.classList.remove('hidden');
            authContainer.style.setProperty('display', 'flex', 'important');
        }
    }, 3000);

    // అన్ని మాడ్యూల్స్ యాక్టివేట్ చేయడం
    try { initAuthListeners(); } catch(e) { console.error("Auth init failed:", e); }
    try { initAppNavigation(); } catch(e) { console.error("Nav init failed:", e); }
    try { initMobilePrivacyHold(); } catch(e) { console.error("Privacy init failed:", e); }
    try { initModalToggles(); } catch(e) { console.error("Modals init failed:", e); }
    try { initFeatures(); } catch(e) { console.error("Features init failed:", e); }
});

/* ========================================================
   4. AUTH & UI ANIMATIONS
   ======================================================== */
function initAuthListeners() {
    const loginIdInput = document.getElementById('login-id');
    const loginPassInput = document.getElementById('login-password');
    const catContainer = document.getElementById('cat-container');

    // పిల్లి యానిమేషన్స్
    if (loginIdInput && catContainer) {
        loginIdInput.onfocus = () => catContainer.classList.add('cat-peek');
        loginIdInput.onblur = () => catContainer.classList.remove('cat-peek');
    }

    if (loginPassInput && catContainer) {
        loginPassInput.onfocus = () => {
            catContainer.classList.add('cat-peek', 'cat-cover-eyes');
        };
        loginPassInput.onblur = () => {
            catContainer.classList.remove('cat-peek', 'cat-cover-eyes');
        };
    }

    // లాగిన్ / రిజిస్టర్ ట్యాబ్స్ టోగుల్
    const tabRegister = document.getElementById('tab-register');
    const tabLogin = document.getElementById('tab-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabRegister && tabLogin) {
        tabRegister.onclick = () => {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
        };
        tabLogin.onclick = () => {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            tabRegister.classList.remove('active');
            tabLogin.classList.add('active');
        };
    }

    const btnGenJoin = document.getElementById('btn-generate-join');
    const btnLogin = document.getElementById('btn-login');
    if (btnGenJoin) btnGenJoin.onclick = handleRegistration;
    if (btnLogin) btnLogin.onclick = handleLogin;
}

// రిజిస్ట్రేషన్ ప్రాసెస్
async function handleRegistration() {
    if (!supabase) return alert("Database disconnected!");
    const user = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    
    // యూనిక్ ID జనరేషన్
    const uniqueId = `${user.toLowerCase()}#${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from('users').insert([{ username: user, email: email, password: pass, unique_id: uniqueId, referrals: 0 }]);
    if (!error) { 
        alert(`Welcome to True Chats! Your Unique ID: ${uniqueId}`); 
        location.reload(); 
    } else { 
        alert("Registration failed: " + error.message); 
    }
}

// లాగిన్ ప్రాసెస్
async function handleLogin() {
    if (!supabase) return alert("Database disconnected!");
    const idOrMail = document.getElementById('login-id').value;
    const pass = document.getElementById('login-password').value;

    const { data } = await supabase.from('users').select('*').or(`email.eq.${idOrMail},unique_id.eq.${idOrMail}`).eq('password', pass).single();
    if (data) { 
        currentUser = data; 
        launchApp(); 
    } else { 
        alert("Invalid Username or Password!"); 
    }
}

function launchApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('display-profile-username').innerText = currentUser.username;
    
    // గోల్డెన్ స్టార్ లాజిక్
    if (currentUser.referrals >= 5) {
        const star = document.getElementById('golden-star');
        if (star) star.classList.remove('hidden');
    }
    setupRealtimeSubscriptions();
}

/* ========================================================
   5. NAVIGATION & MODALS
   ======================================================== */
function initAppNavigation() {
    const navItems = document.querySelectorAll('.footer-nav-item');
    navItems.forEach(item => {
        item.onclick = () => {
            const tab = item.getAttribute('data-tab');
            document.querySelectorAll('.tab-screen').forEach(s => s.classList.add('hidden'));
            const target = document.getElementById(`screen-${tab}`);
            if (target) target.classList.remove('hidden');
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        };
    });
}

function initModalToggles() {
    // Search 
    const btnSearch = document.getElementById('btn-trigger-search');
    if (btnSearch) btnSearch.onclick = () => {
        document.getElementById('panel-search-modal').classList.remove('hidden');
        const searchInput = document.getElementById('input-search-query');
        if(searchInput) searchInput.focus(); // కీబోర్డ్ ఆటోమేటిక్ గా రావడానికి
    };
    const btnCloseSearch = document.getElementById('btn-close-search');
    if (btnCloseSearch) btnCloseSearch.onclick = () => document.getElementById('panel-search-modal').classList.add('hidden');

    // Notifications
    const btnNotif = document.getElementById('btn-trigger-notifications');
    if (btnNotif) btnNotif.onclick = () => {
        document.getElementById('panel-notifications-modal').classList.remove('hidden');
        const badge = document.getElementById('global-notif-count');
        if (badge) badge.classList.add('hidden');
    };
    const btnCloseNotif = document.getElementById('btn-close-notifications');
    if (btnCloseNotif) btnCloseNotif.onclick = () => document.getElementById('panel-notifications-modal').classList.add('hidden');

    // Settings
    const btnSettings = document.getElementById('btn-trigger-settings');
    if (btnSettings) btnSettings.onclick = () => document.getElementById('panel-settings-modal').classList.remove('hidden');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) btnCloseSettings.onclick = () => document.getElementById('panel-settings-modal').classList.add('hidden');

    // QR Code 
    const btnQR = document.getElementById('btn-qr-hub');
    if (btnQR) btnQR.onclick = () => {
        document.getElementById('panel-qr-modal').classList.remove('hidden');
        generateMyQR();
    };

    // Logout
    const btnLogout = document.getElementById('btn-system-logout');
    if (btnLogout) btnLogout.onclick = () => location.reload();
}

/* ========================================================
   6. PRIVACY VAULT LOGIC (DARK UI)
   ======================================================== */
function initMobilePrivacyHold() {
    const zone = document.getElementById('header-profile-zone');
    if (!zone) return;

    // మొబైల్ సపోర్ట్
    zone.addEventListener('touchstart', () => {
        holdTimer = setTimeout(() => {
            const lock = document.getElementById('security-lock-gate');
            if (lock) lock.classList.remove('hidden');
        }, 1500);
    }, { passive: true });
    zone.addEventListener('touchend', () => clearTimeout(holdTimer));
    
    // డెస్క్‌టాప్ సపోర్ట్
    zone.onmousedown = () => {
        holdTimer = setTimeout(() => {
            const lock = document.getElementById('security-lock-gate');
            if (lock) lock.classList.remove('hidden');
        }, 1500);
    };
    zone.onmouseup = () => clearTimeout(holdTimer);
}

// PIN ఎంటర్ చేసే లాజిక్
const pinInputs = document.querySelectorAll('.pin-digit-box');
pinInputs.forEach((input, index) => {
    input.onkeyup = (e) => {
        if (e.target.value && index < 3) pinInputs[index + 1].focus();
        if (index === 3) {
            let code = ""; pinInputs.forEach(i => code += i.value);
            if (code === "1234") enterDarkVault(); else alert("Access Denied!");
        }
    };
});

function enterDarkVault() {
    isPrivateMode = true;
    const lock = document.getElementById('security-lock-gate');
    if (lock) lock.classList.add('hidden');
    document.body.classList.add('pure-dark-theme-override');
    
    const mask = document.getElementById('screenshot-inhibitor-mask-layer');
    if (mask) {
        mask.classList.remove('hidden');
        mask.style.display = 'flex';
        // 2 సెకన్ల తర్వాత మాస్క్ హైడ్ అవుతుంది
        setTimeout(() => mask.style.setProperty('display', 'none', 'important'), 2000);
    }
}

/* ========================================================
   7. SEARCH & REQUEST SYSTEM
   ======================================================== */
const searchInput = document.getElementById('input-search-query');
if (searchInput) {
    searchInput.oninput = async (e) => {
        if (!supabase) return;
        const query = e.target.value;
        if (query.length >= 1) {
            const { data } = await supabase.from('users').select('*').ilike('username', `%${query}%`);
            renderSearchResults(data);
        }
    };
}

function renderSearchResults(users) {
    const target = document.getElementById('search-results-target');
    if (!target) return;
    target.innerHTML = "";
    users.forEach(u => {
        // తనను తాను సెర్చ్ చేసుకోకుండా
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
    await supabase.from('notifications').insert([{ from_user: currentUser.id, to_user: targetId, type: 'request' }]);
}

/* ========================================================
   8. CORE APP FEATURES (MESSAGING, GLIMPSE, WEBRTC)
   ======================================================== */
function initFeatures() {
    // మెసేజ్ పంపే బటన్
    const sendBtn = document.getElementById('btn-transmit-packet');
    if (sendBtn) sendBtn.onclick = sendMessage;

    // సెట్టింగ్స్ - యూజర్‌నేమ్ అప్‌డేట్
    const btnSaveUser = document.getElementById('btn-save-username');
    if (btnSaveUser) {
        btnSaveUser.onclick = async () => {
            const newName = document.getElementById('settings-username-input').value;
            const { error } = await supabase.from('users').update({ username: newName }).eq('id', currentUser.id);
            if (!error) {
                alert("Username Updated!");
                const disp = document.getElementById('display-profile-username');
                if (disp) disp.innerText = newName;
            }
        };
    }

    // వెబ్-ఆర్టీసీ కాల్ కట్ చేయడం
    const btnTerminate = document.getElementById('btn-hardware-terminate-session');
    if (btnTerminate) {
        btnTerminate.onclick = () => {
            const localVideo = document.getElementById('webrtc-local-video-element');
            if (localVideo && localVideo.srcObject) {
                localVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            const callLayer = document.getElementById('webrtc-call-interface-layer');
            if (callLayer) callLayer.classList.add('hidden');
        };
    }
}

// చాటింగ్ ఫంక్షన్
async function sendMessage() {
    const input = document.getElementById('input-chat-message-payload');
    if (!input) return;
    const message = input.value.trim();
    
    if (!message || !activeChat) return;

    const { error } = await supabase.from('messages').insert([
        { sender_id: currentUser.id, receiver_id: activeChat.id, content: message, timestamp: new Date().toISOString() }
    ]);

    if (!error) {
        input.value = "";
        renderSingleMessage({ sender_id: currentUser.id, content: message });
    }
}

// మెసేజ్ స్క్రీన్ మీద చూపించడం
function renderSingleMessage(msg) {
    const container = document.getElementById('chat-messages-scroll-zone');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = `message-bubble ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`;
    div.innerText = msg.content;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight; // ఆటోమేటిక్ గా కిందికి స్క్రోల్ అవ్వడానికి
}

// గ్లింప్స్ (స్టోరీస్) పోస్ట్ చేయడం
async function postGlimpse(mediaUrl) {
    const { error } = await supabase.from('glimpses').insert([
        { user_id: currentUser.id, media_url: mediaUrl, expires_at: new Date(Date.now() + 86400000) } // 24 గంటలు
    ]);
    if (!error) alert("Glimpse Shared!");
}

// ఆడియో / వీడియో కాలింగ్
async function startCall(isVideo = false) {
    const callLayer = document.getElementById('webrtc-call-interface-layer');
    const localVideo = document.getElementById('webrtc-local-video-element');
    const stateLabel = document.getElementById('call-link-state-label');

    if (callLayer) callLayer.classList.remove('hidden');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
        if (localVideo) localVideo.srcObject = stream;
    } catch (err) {
        console.error("Media Error:", err);
    }
    
    if (stateLabel) stateLabel.innerText = "Ringing...";
}

// QR కోడ్ జనరేటర్
function generateMyQR() {
    const qrContainer = document.getElementById('qrcode-canvas-target');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = ""; // పాతది క్లియర్ చేస్తుంది
    
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: currentUser.unique_id,
            width: 200,
            height: 200
        });
    }
}

// రియల్ టైమ్ నోటిఫికేషన్స్ బ్యాడ్జ్ కౌంట్
function setupRealtimeSubscriptions() {
    if (!supabase || !currentUser) return;
    supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `to_user=eq.${currentUser.id}` }, payload => {
            const badge = document.getElementById('global-notif-count');
            if (badge) {
                badge.innerText = parseInt(badge.innerText || "0") + 1;
                badge.classList.remove('hidden');
            }
        })
        .subscribe();
            }
