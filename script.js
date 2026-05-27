/* ========================================================
   TRUE CHATS - MASTER JAVASCRIPT ENGINE
   ======================================================== */

// 1. SUPABASE CONFIGURATION (నీ క్రెడెన్షియల్స్ ఇక్కడ పెట్టు)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. STATE MANAGEMENT
let currentUser = null;
let activeChat = null;
let isPrivateMode = false;
let peerConnection = null;

// 3. INITIALIZATION & NC LOADING
window.addEventListener('DOMContentLoaded', () => {
    console.log("True Chats Engine Initialized...");
    
    // Simulate NC Loading for 3 seconds
    setTimeout(() => {
        document.getElementById('nc-loading').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
    }, 3000);

    initAuthListeners();
    initAppNavigation();
});

/* ========================================================
   AUTH & CAT ANIMATIONS
   ======================================================== */
function initAuthListeners() {
    const loginIdInput = document.getElementById('login-id');
    const loginPassInput = document.getElementById('login-password');
    const catContainer = document.getElementById('cat-container');

    // Cat Peekaboo logic
    loginIdInput.addEventListener('focus', () => catContainer.classList.add('cat-peek'));
    loginIdInput.addEventListener('blur', () => catContainer.classList.remove('cat-peek'));

    // Cat Cover Eyes logic (Password focus)
    loginPassInput.addEventListener('focus', () => {
        catContainer.classList.add('cat-peek');
        catContainer.classList.add('cat-cover-eyes');
    });
    loginPassInput.addEventListener('blur', () => {
        catContainer.classList.remove('cat-peek');
        catContainer.classList.remove('cat-cover-eyes');
    });

    // Toggle Tabs
    document.getElementById('tab-register').onclick = () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('tab-register').classList.add('active');
    };

    document.getElementById('btn-generate-join').onclick = handleRegistration;
    document.getElementById('btn-login').onclick = handleLogin;
}

// Generate Unique #ID Logic
function generateUniqueId(username) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${username.toLowerCase()}#${randomNum}`;
}

async function handleRegistration() {
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
        document.getElementById('golden-star').classList.remove('hidden');
    }

    setupRealtimeSubscriptions();
}

function initAppNavigation() {
    const navItems = document.querySelectorAll('.footer-nav-item');
    navItems.forEach(item => {
        item.onclick = () => {
            const tab = item.getAttribute('data-tab');
            document.querySelectorAll('.tab-screen').forEach(s => s.classList.add('hidden'));
            document.getElementById(`screen-${tab}`).classList.remove('hidden');
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        };
    });
}

/* ========================================================
   PRIVACY CHAT & DARK UI (1.5s Hold Feature)
   ======================================================== */
let holdTimer;
const profileZone = document.getElementById('header-profile-zone');

profileZone.onmousedown = () => {
    holdTimer = setTimeout(() => {
        openPrivacyLock();
    }, 1500);
};

profileZone.onmouseup = () => clearTimeout(holdTimer);

function openPrivacyLock() {
    document.getElementById('security-lock-gate').classList.remove('hidden');
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
    // Default PIN 1234 for testing
    let code = "";
    pinInputs.forEach(i => code += i.value);
    
    if (code === "1234") {
        enterDarkVault();
    } else {
        alert("Access Denied!");
        document.getElementById('security-lock-gate').classList.add('hidden');
    }
}

function enterDarkVault() {
    isPrivateMode = true;
    document.getElementById('security-lock-gate').classList.add('hidden');
    document.body.classList.add('pure-dark-theme-override');
    document.getElementById('screenshot-inhibitor-mask-layer').classList.remove('hidden');
    
    // Anti-Screenshot logic (HTML/CSS only, browser limitations apply)
    setTimeout(() => {
        document.getElementById('screenshot-inhibitor-mask-layer').classList.add('hidden');
    }, 2000);
}

/* ========================================================
   SEARCH & REQUEST SYSTEM
   ======================================================== */
const searchInput = document.getElementById('input-search-query');
searchInput.oninput = async (e) => {
    const query = e.target.value;
    if (query.length >= 1) {
        const { data } = await supabase
            .from('users')
            .select('*')
            .ilike('username', `%${query}%`);
        
        renderSearchResults(data);
    }
};

function renderSearchResults(users) {
    const target = document.getElementById('search-results-target');
    target.innerHTML = "";
    users.forEach(u => {
        if (u.id === currentUser.id) return;
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
    btn.innerText = "Sent✓";
    btn.disabled = true;
    // Logic to insert into notifications table in Supabase
    await supabase.from('notifications').insert([
        { from_user: currentUser.id, to_user: targetId, type: 'request' }
    ]);
}

/* ========================================================
   WEBRTC CALLING (Basic Setup)
   ======================================================== */
async function startCall(isVideo = false) {
    document.getElementById('webrtc-call-interface-layer').classList.remove('hidden');
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideo, 
        audio: true 
    });
    document.getElementById('webrtc-local-video-element').srcObject = stream;
    
    // Signaling logic using Supabase Realtime goes here
    document.getElementById('call-link-state-label').innerText = "Ringing...";
}

document.getElementById('btn-hardware-terminate-session').onclick = () => {
    const stream = document.getElementById('webrtc-local-video-element').srcObject;
    stream.getTracks().forEach(track => track.stop());
    document.getElementById('webrtc-call-interface-layer').classList.add('hidden');
};

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
    supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `to_user=eq.${currentUser.id}` }, payload => {
            updateNotificationCount();
        })
        .subscribe();
}

function updateNotificationCount() {
    const badge = document.getElementById('global-notif-count');
    let count = parseInt(badge.innerText) + 1;
    badge.innerText = count;
    badge.classList.remove('hidden');
}

// 3 Lines Settings Toggle
document.getElementById('btn-trigger-settings').onclick = () => {
    document.getElementById('panel-settings-modal').classList.toggle('hidden');
};

document.getElementById('btn-system-logout').onclick = () => {
    location.reload();
};
