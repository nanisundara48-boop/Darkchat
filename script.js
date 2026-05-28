/* =========================================
   1. SUPABASE INITIALIZATION
========================================= */
const _supabaseUrl = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const _supabaseAnonKey = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';
const supabase = supabase.createClient(_supabaseUrl, _supabaseAnonKey);

// UI Elements
const authScreen = document.getElementById('auth-screen');
const loadingScreen = document.getElementById('nc-loading-screen');
const mainApp = document.getElementById('main-app-interface');

/* =========================================
   2. AUTHENTICATION (SIGNUP & LOGIN)
========================================= */

// Toggle between Login and Register
document.getElementById('toggle-auth-btn').addEventListener('click', () => {
    const isLogin = document.getElementById('new-user-form').classList.toggle('hidden');
    document.getElementById('existing-user-form').classList.toggle('hidden');
    document.getElementById('toggle-auth-btn').innerText = isLogin ? "First time? Create #ID" : "Already have an account? Login";
});

// Registration Logic
document.getElementById('btn-register').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;

    if (!username || !email || !password) return alert("All fields are required!");

    const uniqueID = username + "#" + Math.floor(1000 + Math.random() * 9000);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { username: username, unique_id: uniqueID } }
    });

    if (error) alert(error.message);
    else {
        alert("Registration Success! Your ID: " + uniqueID);
        startAppFlow(username);
    }
});

// Login Logic
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else startAppFlow(data.user.user_metadata.username);
});

function startAppFlow(username) {
    authScreen.classList.replace('active', 'hidden');
    loadingScreen.classList.replace('hidden', 'active');

    document.getElementById('main-username').innerText = username;

    setTimeout(() => {
        loadingScreen.classList.replace('active', 'hidden');
        mainApp.classList.replace('hidden', 'active');
    }, 2500);
}

/* =========================================
   3. TAB NAVIGATION
========================================= */
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

/* =========================================
   4. PRIVACY HOLD FEATURE (1.5 SECONDS)
========================================= */
const userHeader = document.getElementById('main-username');
const privateModal = document.getElementById('private-auth-modal');
const protectionLayer = document.getElementById('screenshot-protection-layer');
let holdTimer;

function triggerPrivateMode() {
    holdTimer = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(100);
        privateModal.classList.replace('hidden', 'active');
        protectionLayer.style.backdropFilter = "blur(15px)";
        protectionLayer.style.background = "rgba(0,0,0,0.5)";
    }, 1500);
}

userHeader.addEventListener('mousedown', triggerPrivateMode);
userHeader.addEventListener('touchstart', triggerPrivateMode);
userHeader.addEventListener('mouseup', () => clearTimeout(holdTimer));
userHeader.addEventListener('touchend', () => clearTimeout(holdTimer));

document.getElementById('cancel-private').addEventListener('click', () => {
    privateModal.classList.replace('active', 'hidden');
    protectionLayer.style.backdropFilter = "none";
    protectionLayer.style.background = "none";
});

/* =========================================
   5. WEBRTC VIDEO CALLING (BASIC SETUP)
========================================= */
let localStream;
let peerConnection;
const servers = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };

async function startCall(type) {
    document.getElementById('webrtc-call-screen').classList.replace('hidden', 'active');
    document.getElementById('call-status-text').innerText = "Ringing...";
    
    localStream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    document.getElementById('local-video').srcObject = localStream;

    // WebRTC Signaling Logic (Supabase Realtime ద్వారా ఇక్కడ కనెక్ట్ చేయాలి)
    console.log("WebRTC Initialized for " + type);
}

document.getElementById('start-video-call').addEventListener('click', () => startCall('video'));
document.getElementById('end-call-btn').addEventListener('click', () => {
    localStream.getTracks().forEach(track => track.stop());
    document.getElementById('webrtc-call-screen').classList.replace('active', 'hidden');
});
